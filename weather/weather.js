// -------------------------
// CONFIGURATION
// -------------------------
const apiKey = '4b273dd3e9c8460787d160138260602';

// Popular cities for dropdown
const cities = ['Hubli', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad'];

// -------------------------
// SELECT ELEMENTS
// -------------------------
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const tempEl = document.querySelector('.temp');
const conditionEl = document.querySelector('.condition');
const locationEl = document.querySelector('.location');
const iconEl = document.querySelector('.weather-icon');
const appEl = document.querySelector('.app');

const feelsLikeEl = document.querySelector('.details .card:nth-child(1) .value');
const humidityEl = document.querySelector('.details .card:nth-child(2) .value');
const windEl = document.querySelector('.details .card:nth-child(3) .value');
const pressureEl = document.querySelector('.details .card:nth-child(4) .value');

const dateEl = document.querySelector('.date');

// -------------------------
// HELPER FUNCTIONS
// -------------------------

// Format date like "Monday, 6 Feb"
function formatDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Map OpenWeatherMap icons to icons
function getWeatherIcon(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Change background based on weather
function updateBackground(main) {
    main = main.toLowerCase();
    if (main.includes('cloud')) appEl.style.background = 'linear-gradient(to right, #bdc3c7, #2c3e50)';
    else if (main.includes('rain')) appEl.style.background = 'linear-gradient(to right, #4e54c8, #8f94fb)';
    else if (main.includes('sun') || main.includes('clear')) appEl.style.background = 'linear-gradient(to right, #fceabb, #f8b500)';
    else if (main.includes('snow')) appEl.style.background = 'linear-gradient(to right, #e0eafc, #cfdef3)';
    else appEl.style.background = 'linear-gradient(to right, #00c6ff, #0072ff)'; // default
}

// Show error
function showError(message) {
    tempEl.textContent = '--';
    conditionEl.textContent = message;
    locationEl.textContent = '';
    iconEl.src = '';
    feelsLikeEl.textContent = '--';
    humidityEl.textContent = '--';
    windEl.textContent = '--';
    pressureEl.textContent = '--';
    appEl.style.background = 'linear-gradient(to right, #ff6a00, #ee0979)';
}

// -------------------------
// FETCH WEATHER DATA
// -------------------------
async function getWeather(city) {
    if (!city) {
        alert('Please enter a city name');
        return;
    }

    // Show loading
    tempEl.textContent = 'Loading...';
    conditionEl.textContent = '';
    locationEl.textContent = '';
    iconEl.src = '';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');

        const data = await response.json();

        // Update main weather section
        tempEl.textContent = `${Math.round(data.main.temp)}°`;
        conditionEl.textContent = data.weather[0].description
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        locationEl.textContent = `📍 ${data.name}`;
        iconEl.src = getWeatherIcon(data.weather[0].icon);
        iconEl.alt = data.weather[0].description;

        // Update details section
        feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${Math.round(data.wind.speed)} km/h`;
        pressureEl.textContent = `${data.main.pressure} hPa`;

        // Update background
        updateBackground(data.weather[0].main);

    } catch (error) {
        showError(error.message);
    }
}

// -------------------------
// EVENT LISTENERS
// -------------------------
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    getWeather(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        getWeather(city);
    }
});

// Dropdown for popular cities
function createCityButtons() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.margin = '10px 0';
    container.style.flexWrap = 'wrap';
    container.style.gap = '10px';

    cities.forEach(city => {
        const btn = document.createElement('button');
        btn.textContent = city;
        btn.style.padding = '5px 10px';
        btn.style.borderRadius = '5px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.background = '#ff9800';
        btn.style.color = '#fff';
        btn.addEventListener('click', () => getWeather(city));
        container.appendChild(btn);
    });

    appEl.insertBefore(container, appEl.firstChild.nextSibling); // place below title
}

// -------------------------
// INITIALIZE APP
// -------------------------
formatDate();
createCityButtons();

// Try to get user location on load
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
                .then(res => res.json())
                .then(data => getWeather(data.name))
                .catch(() => getWeather('Hubli')); // fallback
        },
        () => getWeather('Hubli') // fallback if geolocation denied
    );
} else {
    getWeather('Hubli'); // default city
}
