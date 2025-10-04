// Analyze seat suggestion based on route direction, travel time, and sunlight info
export const analyzeSeatSuggestion = (direction, travelTime, sunOrNasa) => {
  if (!travelTime) return "No data";

  const [hour, minute] = travelTime.split(":").map(Number);
  const timeInHours = hour + minute / 60;

  let seat = "Any seat";

  // ☀ Logic based on sunlight & direction
  if (timeInHours >= 5 && timeInHours <= 9) {
    // Morning: Sun rises in the east
    if (direction === "East") seat = "Left side (avoid glare)";
    else if (direction === "West") seat = "Right side (sunlight advantage)";
    else seat = "Right side";
  } else if (timeInHours >= 16 && timeInHours <= 19) {
    // Evening: Sun sets in the west
    if (direction === "East") seat = "Right side (shade)";
    else if (direction === "West") seat = "Left side (avoid glare)";
    else seat = "Left side";
  } else {
    seat = "Middle or shaded side (sun not intense)";
  }

  // 🌦 Adjust based on clearness index if NASA data exists
  if (sunOrNasa && sunOrNasa.clearnessIndex < 0.3) {
    seat += " — cloudy weather, any seat is fine!";
  } else if (sunOrNasa && sunOrNasa.clearnessIndex > 0.7) {
    seat += " — clear skies, avoid direct sun!";
  }

  return seat;
};
