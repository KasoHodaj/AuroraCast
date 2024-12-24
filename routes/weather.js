const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const city = req.query.city || 'Thessaloniki'; // Default city if none is provided
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        // Fetch geolocation data
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`;
        const geoResponse = await axios.get(geoUrl);
        if (!geoResponse.data[0]) throw new Error('City not found.');

        const { lat, lon } = geoResponse.data[0];

        // Fetch weather data
        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        // Render weather data
        res.render('index', { weather: weatherData, city: city });
    } catch (error) {
        console.error(error.message);
        res.render('error', { error: error.message || 'Unable to fetch weather data. Please try again.' });
    }
});

module.exports = router;
