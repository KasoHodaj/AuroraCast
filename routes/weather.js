const express = require("express");
const axios = require("axios");
const router = express.Router();
const fs = require("fs");                // <-- 1) Import the fs module
const path = require("path");            // <-- 2) Import path if needed


// 1. Define the helper function AT THE TOP (outside the route)
function generateHighlights(temp, humidity, pressure, visibility, aqiStatus) {
  // build your dynamic summary here
  let statements = [];

  if (temp >= 30) {
    statements.push("it's quite hot");
  } else if (temp <= 10) {
    statements.push("it's fairly cold");
  } else {
    statements.push("conditions are mild");
  }

  if (humidity > 70) {
    statements.push("with high humidity");
  } else {
    statements.push("with moderate humidity");
  }

  if (pressure >= 1010 && pressure <= 1020) {
    statements.push("stable atmospheric pressure");
  } else if (pressure < 1010) {
    statements.push("slightly lower atmospheric pressure");
  } else {
    statements.push("slightly higher atmospheric pressure");
  }

  if (visibility > 8) {
    statements.push("and clear visibility");
  } else {
    statements.push(`and visibility around ${visibility} km`);
  }

  if (aqiStatus === "Good" || aqiStatus === "Fair") {
    statements.push(`Air quality is classified as ${aqiStatus}, indicating minimal pollutant levels.`);
  } else {
    statements.push(`Air quality is classified as ${aqiStatus}, indicating higher pollutant levels.`);
  }

  const summary = "Currently, " 
    + statements.slice(0, -1).join(", ") 
    + " and " 
    + statements.slice(-1) 
    + ".";

  return summary;
}

router.get("/", async (req, res) => {
  const city = req.query.city || "Thessaloniki"; // Default city
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    // Fetch geolocation data
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`;
    const geoResponse = await axios.get(geoUrl);
    if (!geoResponse.data[0]) throw new Error("City not found.");

    const { lat, lon, name, state, country } = geoResponse.data[0];

    // Fetch weather data
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=metric`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // ********** FETCH AIR QUALITY DATA **********
    const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const aqiResponse = await axios.get(aqiUrl);
    const aqiData = aqiResponse.data; // <--- define aqiData here

    // Extract current weather data
    const currentDate = new Date();
    const current = {
      temp: `${Math.round(weatherData.current.temp)}°C`,
      icon: `http://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png`,
      condition: weatherData.current.weather[0].description,
      date: currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }),
      location: `${name}, ${state || ""}, ${country}`
        .replace(/, ,/g, ",")
        .trim(),
    };

    // Extract 7-day forecast data
    const forecast = weatherData.daily.slice(0, 7).map((day) => {
      const date = new Date(day.dt * 1000); // Convert Unix timestamp to JS Date
      return {
        name: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        icon: `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
        description: day.weather[0].description,
        temp: `${Math.round(day.temp.day)}°C`,
      };
    });

    const todayName = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    }); // Today's day name

    // 6. Extract AQI data and pollutant components
    // OpenWeather returns AQI as an integer 1–5, where:
    //   1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    const aqiValue = aqiData.list?.[0]?.main?.aqi || 1; // Default to 1 if undefined
    const aqiComponents = aqiData.list?.[0]?.components || {};

    // Function to interpret AQI value
    function getAqiStatus(aqi) {
      switch (aqi) {
        case 1:
          return "Good";
        case 2:
          return "Fair";
        case 3:
          return "Moderate";
        case 4:
          return "Poor";
        case 5:
          return "Very Poor";
        default:
          return "Unknown";
      }
    }

    const aqiStatus = getAqiStatus(aqiValue);

    // Pollutant components
    const pm25 = aqiComponents.pm2_5; // PM2.5
    const so2 = aqiComponents.so2; // Sulfur Dioxide
    const no2 = aqiComponents.no2; // Nitrogen Dioxide
    const o3 = aqiComponents.o3; // Ozone

    // 7. Extract additional weather details (humidity, pressure, etc.)
    // 7. Extract additional weather details
    const tempValue = Math.round(weatherData.current.temp);
    const humidity = weatherData.current.humidity;
    const pressure = weatherData.current.pressure;
    const visibilityMeters = weatherData.current.visibility || 0;
    const visibility = (visibilityMeters / 1000).toFixed(1);
    const feelsLike = Math.round(weatherData.current.feels_like);
    // Generate a dynamic summary
    const highlights = generateHighlights(
      tempValue,
      humidity,
      pressure,
      visibility,
      aqiStatus
    );


     // *** NEW *** LOG SEARCH TO A FILE
     const dataFilePath = path.join(__dirname, "..", "searchData.json");
     const newSearch = {
       city: city,
       lat,
       lon,
       timestamp: new Date().toISOString(),
     };
 
     fs.readFile(dataFilePath, "utf8", (err, data) => {
       if (err) {
         // If file not found or error reading, we log it but don't stop
         console.error("Could not read searchData.json:", err.message);
       }
 
       let searchData = [];
       if (data) {
         try {
           searchData = JSON.parse(data);
         } catch (parseErr) {
           console.error("Error parsing JSON:", parseErr);
         }
       }
 
       // Add the new search record
       searchData.push(newSearch);
 
       // Write back to the file
       fs.writeFile(dataFilePath, JSON.stringify(searchData, null, 2), (writeErr) => {
         if (writeErr) {
           console.error("Error writing to searchData.json:", writeErr.message);
         }
       });
     });
     // *** END LOG SEARCH TO A FILE


     
    // 8. Render the EJS template
    // Pass the values you need for the "Today's Forecast" section, as well as
    // anything else (like current weather, forecast, etc.) for the page.
    res.render("index", {
      current,
      forecast,
      todayName,

      // Air Quality data
      pm25,
      so2,
      no2,
      o3,
      aqiStatus,

      // Additional details
      humidity,
      pressure,
      visibility,
      feelsLike,
      highlightsText: highlights,
    });
  } catch (error) {
    console.error(error.message);
    res.render("error", {
      error: error.message || "Unable to fetch weather data. Please try again.",
    });
  }
});

module.exports = router;
