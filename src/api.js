import axios from "axios";

// 🌍 Get coordinates from OpenStreetMap
export const getCoordinates = async (cityName) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      cityName
    )}&format=json&limit=1`;
    const response = await axios.get(url);

    if (response.data.length === 0) return null;

    const { lat, lon } = response.data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

// 🌅 Get sunrise/sunset data from Open-Meteo API
export const getSunData = async (lat, lon) => {
  try {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`;
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching sun data:", error);
    return null;
  }
};

// ☀ Get NASA POWER solar data
export const getNASAData = async (lat, lon, date) => {
  try {
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,CLRSKY_KT&community=RE&longitude=${lon}&latitude=${lat}&start=${date}&end=${date}&format=JSON`;
    const response = await axios.get(url);

    const data = response.data.properties?.parameter;
    if (!data) return null;

    return {
      solarRadiation: data.ALLSKY_SFC_SW_DWN[date],
      clearnessIndex: data.CLRSKY_KT[date],
    };
  } catch (error) {
    console.error("Error fetching NASA data:", error);
    return null;
  }
};
