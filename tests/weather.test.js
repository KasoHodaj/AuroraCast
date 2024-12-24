const axios = require('axios');
jest.mock('axios');

test('fetch weather data for a valid city', async () => {
    const mockResponse = {
        data: {
            current: { temp: 15, weather: [{ description: 'clear sky' }] },
            daily: [
                { temp: { day: 20, night: 10 }, weather: [{ description: 'cloudy' }] },
            ],
        },
    };
    axios.get.mockResolvedValue(mockResponse);

    const response = await axios.get('mock-url');
    expect(response.data.current.temp).toBe(15);
    expect(response.data.daily[0].temp.day).toBe(20);
});
