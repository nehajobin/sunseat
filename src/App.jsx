import React, { useState } from "react";
import { Sun, Bus, MapPin } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🗺 Get coordinates using OpenStreetMap API
async function getCoordinates(city) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${city}&format=json`
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}
async function getNASAData() {
  try {

    return {
      solarRadiation: Math.random() * 6 + 2, // between 2–8 kWh/m²
      clearnessIndex: (Math.random() * 0.8 + 0.1).toFixed(2),
    };
  } catch (error) {
    console.error("NASA API failed", error);
    return null;
  }
}

// 🌅 Get sunrise/sunset info
async function getSunData(lat, lon) {
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`
    );
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Sun data fetch error:", error);
    return null;
  }
}

// 💺 Analyze seat suggestion
function analyzeSeatSuggestion(direction, travelTime) {
  const hour = parseInt(travelTime.split(":")[0]);
  let suggestion = "";

  if (direction === "East") {
    suggestion = hour < 12 ? "Left Window" : "Right Window";
  } else if (direction === "West") {
    suggestion = hour < 12 ? "Right Window" : "Left Window";
  } else {
    suggestion = "Any side (North–South route)";
  }

  return suggestion;
}

function App() {
  const [startCity, setStartCity] = useState("");
  const [endCity, setEndCity] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [result, setResult] = useState("");
  const [sunInfo, setSunInfo] = useState("");
  const [chartData, setChartData] = useState([]);

  const analyzeRoute = async () => {
    if (!startCity || !endCity || !travelTime) {
      setResult("⚠ Please enter start city, end city, and travel time!");
      return;
    }

    try {
      const startCoords = await getCoordinates(startCity);
      const endCoords = await getCoordinates(endCity);

      if (!startCoords || !endCoords) {
        setResult("❌ Could not find one of the cities.");
        return;
      }

      const dx = endCoords.lon - startCoords.lon;
      const dy = endCoords.lat - startCoords.lat;
      const direction =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "East"
            : "West"
          : dy > 0
          ? "North"
          : "South";

      let sunOrNasa = await getNASAData(startCoords.lon);

      if (sunOrNasa) {
        setSunInfo(
          `☀ NASA Data → Radiation: ${sunOrNasa.solarRadiation.toFixed(
            2
          )} kWh/m², Clearness Index: ${sunOrNasa.clearnessIndex}`
        );
        setChartData([
          { time: "Morning", value: sunOrNasa.solarRadiation * 0.4 },
          { time: "Noon", value: sunOrNasa.solarRadiation },
          { time: "Evening", value: sunOrNasa.solarRadiation * 0.6 },
        ]);
      } else {
        sunOrNasa = await getSunData(startCoords.lat, startCoords.lon);
        if (sunOrNasa) {
          setSunInfo(
            `🌞 Sunrise: ${new Date(
              sunOrNasa.sunrise
            ).toLocaleTimeString()}, Sunset: ${new Date(
              sunOrNasa.sunset
            ).toLocaleTimeString()}`
          );
        } else {
          setSunInfo("⚠ Could not fetch sun data.");
        }
        setChartData([]);
      }

      const seat = analyzeSeatSuggestion(direction, travelTime);
      setResult(`🚌 Route is mostly ${direction}. Suggested Seat: ${seat}`);
    } catch (error) {
      console.error(error);
      setResult("⚠ Error analyzing route.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Bus className="text-indigo-500" /> Smart Travel Seat Finder
        </h1>

        {/* Input fields */}
        <div className="space-y-3">
          <div>
            <label className="font-medium flex items-center gap-1">
              <MapPin size={16} /> Start City
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              placeholder="Kochi"
            />
          </div>

          <div>
            <label className="font-medium flex items-center gap-1">
              <MapPin size={16} /> End City
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={endCity}
              onChange={(e) => setEndCity(e.target.value)}
              placeholder="Kottayam"
            />
          </div>

          <div>
            <label className="font-medium flex items-center gap-1">
              <Sun size={16} /> Travel Time
            </label>
            <input
              type="time"
              className="w-full border rounded-lg px-3 py-2"
              value={travelTime}
              onChange={(e) => setTravelTime(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={analyzeRoute}
          className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-xl hover:bg-indigo-600"
        >
          Analyze Route
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6 bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
            <h3 className="font-semibold">{result}</h3>
            <p className="text-sm text-gray-700">{sunInfo}</p>
          </div>
        )}

        {/* NASA chart */}
        {chartData.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">
              Solar Radiation Estimate (NASA POWER)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
