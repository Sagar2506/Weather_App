const apiKey = '45942193b08d5667e553df1aa43773b1'; // Your OpenWeatherMap API key
const weatherOutput = document.getElementById('weatherOutput');

document.getElementById('fetchWeather').addEventListener('click', fetchWeather);

async function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    const unit = document.getElementById('unitSelect').value;
    const maxTempThreshold = parseFloat(document.getElementById('maxTempThreshold').value);

    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    // Fetch current weather
    const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);
    
    if (!currentWeatherResponse.ok) {
        alert('City not found or API error.');
        return;
    }

    const currentWeatherData = await currentWeatherResponse.json();
    displayWeather(currentWeatherData, maxTempThreshold, unit);

    // Fetch and display the weather forecast
    fetchWeatherForecast(city, maxTempThreshold, unit);
}

function displayWeather(data, maxTempThreshold, unit) {
    const main = data.main;
    const weatherCondition = data.weather[0].main;
    const temperature = main.temp;
    const humidity = main.humidity;
    const windSpeed = data.wind.speed; // Wind speed in m/s or mph based on unit

    // Convert Unix timestamp to readable date and time
    const updateTime = new Date(data.dt * 1000).toLocaleString(); 

    weatherOutput.innerHTML = `
        <h2>${data.name}</h2>
        <p>Weather: ${weatherCondition}</p>
        <p>Temperature: ${temperature}°${unit === 'metric' ? 'C' : 'F'}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
        <p>Last Updated: ${updateTime}</p>
    `;

    // Check if temperature exceeds the threshold
    if (maxTempThreshold && temperature > maxTempThreshold) {
        weatherOutput.innerHTML += `<p style="color:red;">Alert: Current temperature exceeds the threshold of ${maxTempThreshold}°${unit === 'metric' ? 'C' : 'F'}!</p>`;
    }
}

// Fetch and display 5-day forecast
async function fetchWeatherForecast(city, maxTempThreshold, unit) {
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);

    if (!forecastResponse.ok) {
        alert('Forecast data not available.');
        return;
    }

    const forecastData = await forecastResponse.json();
    displayForecast(forecastData, maxTempThreshold, unit);
}

// Generate and display daily weather summaries
function displayForecast(forecastData, maxTempThreshold, unit) {
    const forecastOutput = document.createElement('div');
    forecastOutput.innerHTML = '<h3>Daily Weather Summary</h3>';

    const forecastList = forecastData.list;
    const summary = {};

    // Aggregate forecast data by day
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString(); // Convert timestamp to just the date
        const temperature = item.main.temp;
        const weatherCondition = item.weather[0].main;

        if (!summary[date]) {
            summary[date] = {
                temperatures: [],
                weatherConditions: new Set(),
            };
        }

        summary[date].temperatures.push(temperature);
        summary[date].weatherConditions.add(weatherCondition);
    });

    // Generate and display daily summaries for the forecast
    for (const [date, data] of Object.entries(summary)) {
        const avgTemp = (data.temperatures.reduce((a, b) => a + b) / data.temperatures.length).toFixed(1);
        const maxTemp = Math.max(...data.temperatures).toFixed(1);
        const minTemp = Math.min(...data.temperatures).toFixed(1);
        const weatherConditions = Array.from(data.weatherConditions).join(', ');

        forecastOutput.innerHTML += `<p>${date}: ${weatherConditions}, Avg Temp: ${avgTemp}°${unit === 'metric' ? 'C' : 'F'}, Max Temp: ${maxTemp}°${unit === 'metric' ? 'C' : 'F'}, Min Temp: ${minTemp}°${unit === 'metric' ? 'C' : 'F'}</p>`;

        // Check if max temperature exceeds the threshold for the daily summary
        if (maxTempThreshold && maxTemp > maxTempThreshold) {
            forecastOutput.innerHTML += `<p style="color:red;">Alert: Max temperature on ${date} exceeds the threshold of ${maxTempThreshold}°${unit === 'metric' ? 'C' : 'F'}!</p>`;
        }
    }

    weatherOutput.appendChild(forecastOutput);
}
