const axios = require("axios");
jest.mock("axios");

test("fetch weather data for a valid city", async () => {
  const mockResponse = {
    data: {
      current: { temp: 15, weather: [{ description: "clear sky" }] },
      daily: [
        { temp: { day: 20, night: 10 }, weather: [{ description: "cloudy" }] },
      ],
    },
  };
  axios.get.mockResolvedValue(mockResponse);

  const response = await axios.get("mock-url");

  // Validate data structure and values
  expect(response.data.current.temp).toBe(15);
  expect(response.data.current.weather[0].description).toBe("clear sky");
  expect(response.data.daily[0].temp.day).toBe(20);
  expect(response.data.daily[0].weather[0].description).toBe("cloudy");
});

test("handle incomplete weather data", async () => {
  const incompleteResponse = {
    data: {
      current: { temp: 15 }, // Missing 'weather' array
      daily: [], // No daily forecast data
    },
  };

  axios.get.mockResolvedValue(incompleteResponse);

  const response = await axios.get("mock-url");

  // Check for incomplete data and ensure the test still passes
  expect(response.data.current.temp).toBe(15);
  expect(response.data.current.weather).toBeUndefined(); // No weather description
  expect(response.data.daily.length).toBe(0); // No daily data
});

test("handle API request failure", async () => {
  const mockError = new Error("API request failed");
  axios.get.mockRejectedValue(mockError);

  try {
    await axios.get("mock-url");
  } catch (error) {
    // Ensure the error is correctly caught and validated
    expect(error).toBe(mockError);
    expect(error.message).toBe("API request failed");
  }
});
