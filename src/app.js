const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const weatherRoutes = require('../routes/weather');

dotenv.config(); // Load environmental variables from .env file

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve JSON files from the data folder
app.use('/data', express.static(path.join(__dirname, '../data')));
console.log("Serving languages from:", path.join(__dirname, '../data'));


// Use the weather routes
app.use('/', weatherRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); // Fixed log output
