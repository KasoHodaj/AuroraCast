const express = require("express");
const axios = require("axios");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Helper function to generate highlights text
function generateHighlights(temp, humidity, pressure, visibility, aqiStatus) {
  let statements = [];

  if (temp >= 30) statements.push("it's quite hot");
  else if (temp <= 10) statements.push("it's fairly cold");
  else statements.push("conditions are mild");

  if (humidity > 70) statements.push("with high humidity");
  else statements.push("with moderate humidity");

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
    statements.push(
      `Air quality is classified as ${aqiStatus}, indicating minimal pollutant levels.`
    );
  } else {
    statements.push(
      `Air quality is classified as ${aqiStatus}, indicating higher pollutant levels.`
    );
  }

  return (
    "Currently, " +
    statements.slice(0, -1).join(", ") +
    " and " +
    statements.slice(-1) +
    "."
  );
}
router.get('/privacy-policy', (req, res) => {
  res.render('partials/privacy-policy');
});

router.get('/terms-and-conditions', (req, res) => {
  res.render('partials/terms-and-conditions');
});

router.get('/read-me', (req, res) => {
  res.render('partials/read-me');
});



// Main route for fetching weather
router.get("/", async (req, res) => {
  // Grab query parameters from the URL
  const cityQuery = req.query.city || null;
  const latQuery = req.query.lat ? parseFloat(req.query.lat) : null;
  const lonQuery = req.query.lon ? parseFloat(req.query.lon) : null;
  const apiKey = process.env.WEATHER_API_KEY;

  try {
    let city = null;
    let lat = null;
    let lon = null;
    let locationName = null;

    /**
     * 1) If lat/lon are present (clicked "Use My Location"),
     *    do a reverse geocode to find the city name.
     */
    if (latQuery && lonQuery) {
      // Reverse geocode: lat/lon -> city name
      const revGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latQuery}&lon=${lonQuery}&limit=1&appid=${apiKey}`;
      const revGeoResponse = await axios.get(revGeoUrl);

      if (!revGeoResponse.data[0]) {
        throw new Error("Unable to find city name from coordinates.");
      }

      const { name, state, country } = revGeoResponse.data[0];
      lat = latQuery;
      lon = lonQuery;
      // Construct a friendly name like "Athens, Attica, GR"
      locationName = `${name}, ${state || ""}, ${country}`
        .replace(/,\s*,/g, ",")
        .trim();

      /**
       * 2) Else if the user typed a city in the search box,
       *    do a forward geocode to find lat/lon.
       */
    } else if (cityQuery) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityQuery}&limit=1&appid=${apiKey}`;
      const geoResponse = await axios.get(geoUrl);

      if (!geoResponse.data[0]) {
        throw new Error("City not found.");
      }

      const { lat: gLat, lon: gLon, name, state, country } = geoResponse.data[0];
      lat = gLat;
      lon = gLon;
      locationName = `${name}, ${state || ""}, ${country}`
        .replace(/,\s*,/g, ",")
        .trim();

      /**
       * 3) Otherwise, no city and no lat/lon provided:
       *    default to "London."
       */
    } else {
      // Forward geocode "London"
      const defaultCity = "Thessaloniki";
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${defaultCity}&limit=1&appid=${apiKey}`;
      const geoResponse = await axios.get(geoUrl);

      if (!geoResponse.data[0]) {
        throw new Error("City not found (default).");
      }

      const { lat: gLat, lon: gLon, name, state, country } = geoResponse.data[0];
      lat = gLat;
      lon = gLon;
      locationName = `${name}, ${state || ""}, ${country}`
        .replace(/,\s*,/g, ",")
        .trim();
    }

    // ================================
    //  Fetch weather & air quality
    // ================================
    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${apiKey}`;
    const weatherResponse = await axios.get(weatherUrl);
    if (!weatherResponse.data || !weatherResponse.data.current) {
      throw new Error("Invalid weather data received.");
    }
    const weatherData = weatherResponse.data;

    // Air Quality
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const aqiResponse = await axios.get(aqiUrl);
    if (
      !aqiResponse.data ||
      !aqiResponse.data.list ||
      aqiResponse.data.list.length === 0
    ) {
      throw new Error("Air quality data unavailable.");
    }
    const aqiData = aqiResponse.data;

    // Current weather data
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
      location: locationName, // e.g. "Athens, Attica, GR"
    };

    // 7-day forecast
    const forecast = weatherData.daily.slice(0, 7).map((day) => {
      const date = new Date(day.dt * 1000);
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
    });

    // AQI details
    const aqiValue = aqiData.list?.[0]?.main?.aqi || 1;
    const aqiStatus =
      ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiValue - 1] ||
      "Unknown";

    // Generate "highlights" text
    const highlights = generateHighlights(
      Math.round(weatherData.current.temp),
      weatherData.current.humidity,
      weatherData.current.pressure,
      (weatherData.current.visibility || 0) / 1000,
      aqiStatus
    );

    // ================================
    //  Log search queries
    // ================================
    const dataFilePath = path.join(__dirname, "..", "searchData.json");
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, "[]");
    }
    fs.readFile(dataFilePath, "utf8", (err, data) => {
      const searchData = data ? JSON.parse(data) : [];
      searchData.push({
        city: locationName,
        lat,
        lon,
        timestamp: new Date().toISOString(),
      });
      fs.writeFile(dataFilePath, JSON.stringify(searchData, null, 2), () => {});
    });

    // ================================
    //  Load random fact from facts.json
    // ================================
    let facts = [];
    const factsFilePath = path.join(__dirname, "..", "facts.json");
    try {
      const factsData = fs.readFileSync(factsFilePath, "utf8");
      facts = JSON.parse(factsData);
    } catch (err) {
      console.error("Error reading facts file:", err);
      facts = ["Lightning strikes Earth about 8 million times per day."];
    }
    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    // ================================
    //  Render the EJS template
    // ================================
    res.render("index", {
      current,
      forecast,
      todayName,
      pm25: aqiData.list[0].components.pm2_5,
      so2: aqiData.list[0].components.so2,
      no2: aqiData.list[0].components.no2,
      o3: aqiData.list[0].components.o3,
      aqiStatus,
      humidity: weatherData.current.humidity,
      pressure: weatherData.current.pressure,
      visibility: (weatherData.current.visibility || 0) / 1000,
      feelsLike: Math.round(weatherData.current.feels_like),
      highlightsText: highlights,
      didYouKnow: randomFact,
    });
  } catch (error) {
    console.error(error.message);
    res.render("error", {
      error: error.message || "Weather data unavailable. Try again later.",
    });
  }
});

module.exports = router;
