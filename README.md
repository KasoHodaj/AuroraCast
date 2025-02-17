# AuroraCast

A dynamic, **open-source** weather application providing real-time weather data, a 7-day forecast, Air Quality Index (AQI) information, and more. Built with **Node.js**, **Express**, and **EJS** templates for a modern, responsive experience.

---

## Table of Contents
1. [Project Goals](#project-goals)  
2. [Screenshots](#screenshots)  
3. [Features](#features)  
4. [Technology Stack](#technology-stack)  
5. [APIs Used](#apis-used)  
6. [Installation and Setup](#installation-and-setup)  
7. [Contributing](#contributing)  
8. [Notes](#Notes)  

---

## Project Goals
- Provide **accurate real-time weather updates**  
- Show a **seven-day forecast**  
- Display **Air Quality Index (AQI)** information  
- Generate **weather highlights** based on conditions  
- Support **multiple languages** (in progress)  
- Offer a **modern and responsive interface**  
- Enable **location-based** weather fetching  

---

## Screenshots

<details>
  <summary>Homepage & Forecast</summary>
  ![image](https://github.com/user-attachments/assets/16e24b1d-ae41-475e-8e46-f8cda832f76b)
</details>

<details>
  <summary>Language & Theme Dropdowns</summary>
  ![image](https://github.com/user-attachments/assets/9095602b-098b-4f64-9846-d6e50c420c05)
  ![image](https://github.com/user-attachments/assets/9b286d61-af42-447c-b45d-103c0fd5b0ad)
</details>

<details>
  <summary>Privacy Policy & Terms</summary>
  ![image](https://github.com/user-attachments/assets/f5fcee44-b432-403a-8c0c-0369d063bff2)
  ![image](https://github.com/user-attachments/assets/de332e77-1d87-4dd1-9134-17c651a2855e)
</details>

---

## Features

1. **Current Weather**  
   - Displays current temperature, weather condition, date, and location.

2. **Seven-Day Forecast**  
   - Provides daily temperature updates with weather icons for quick reference.

3. **Air Quality Index (AQI)**  
   - Shows pollutant levels (PM2.5, SO2, NO2, O3) with a status rating (e.g., Good, Moderate).

4. **Highlights**  
   - Automatically generates short summaries based on current conditions (e.g., "mild weather with moderate humidity").

5. **Location-Based Weather**  
   - Fetches the user’s current coordinates via the Geolocation API to display localized weather.

6. **Responsive Design**  
   - Works seamlessly on desktop, tablet, and mobile devices.

7. **Light/Dark Theme** *(currently in progress)*  
   - Provides a toggle to switch between original (light) theme and a standard dark theme.

---

## Technology Stack

**Frontend**  
- HTML, CSS, JavaScript  
- EJS (Embedded JavaScript) for templating

**Backend**  
- Node.js  
- Express.js  
- Axios for API requests  
- dotenv for environment variables

---

## APIs Used
- **OpenWeatherMap API** for weather and AQI data  
- **Geolocation API** for retrieving the user’s location

---

## Installation and Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/KasoHodaj/AuroraCast.git
   cd AuroraCast

2. **Install Dependencies**
   ```bash
   npm install

3. **Set Up Environment Variables**
   ```bash
   WEATHER_API_KEY=your_openweathermap_api_key

4. **Start the Server**
   ```bash
   npm start
   ***The app will be running at http://localhost:3000.***


## Contributing
This will be an open-source project, and contributions are welcome. You can:

1. **Submit bug reports or feature requests via Issues**
2. **Open pull requests for improvements**
3. **Share ideas to enhance the project**


## Notes
Language Support: Currently, the language feature is incomplete, and the theme toggle is disabled by default. Future updates will enable both features.

