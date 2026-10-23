// Weather Code Maps to Condition & Unsplash BG Image
const weatherMap = {
    0: { label: "Clear Sky", icon: "fa-sun", bg: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=1000" },
    1: { label: "Mainly Clear", icon: "fa-cloud-sun", bg: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1000" },
    2: { label: "Partly Cloudy", icon: "fa-cloud-sun", bg: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1000" },
    3: { label: "Overcast", icon: "fa-cloud", bg: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=1000" },
    45: { label: "Foggy", icon: "fa-smog", bg: "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1000" },
    61: { label: "Slight Rain", icon: "fa-cloud-rain", bg: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1000" },
    63: { label: "Moderate Rain", icon: "fa-cloud-showers-heavy", bg: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1000" },
    65: { label: "Heavy Rain", icon: "fa-cloud-showers-heavy", bg: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1000" },
    71: { label: "Snow Fall", icon: "fa-snowflake", bg: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=1000" },
    95: { label: "Thunderstorm", icon: "fa-bolt", bg: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1000" }
};

const cityInput = document.getElementById('cityInput');
const phoneFrame = document.getElementById('phoneFrame');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

let isDark = true;

// ====== Light/Dark Theme Switcher ======
themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
        phoneFrame.removeAttribute('data-theme');
        themeIcon.className = 'fa-solid fa-moon';
    } else {
        phoneFrame.setAttribute('data-theme', 'light');
        themeIcon.className = 'fa-solid fa-sun';
    }
});

// ====== Search Input Handler ======
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherData(cityInput.value.trim());
    }
});

// ====== Fetch Coordinates & Weather ======
async function getWeatherData(cityName) {
    try {
        // 1. Geocoding API to get Lat & Lon
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert('City not found!');
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        document.getElementById('cityName').textContent = `${name}, ${country || ''}`;

        // 2. Open-Meteo Weather API
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const weatherData = await weatherRes.json();

        renderWeatherUI(weatherData);

    } catch (err) {
        console.error("Error fetching weather:", err);
    }
}

// ====== Render Weather UI ======
function renderWeatherUI(data) {
    const current = data.current_weather;
    const daily = data.daily;
    const hourly = data.hourly;

    const info = weatherMap[current.weathercode] || weatherMap[0];

    // Set main info
    document.getElementById('currentTemp').textContent = Math.round(current.temperature);
    document.getElementById('weatherCondition').textContent = info.label;
    document.getElementById('maxTemp').textContent = Math.round(daily.temperature_2m_max[0]);
    document.getElementById('minTemp').textContent = Math.round(daily.temperature_2m_min[0]);

    // Update Dynamic Unsplash Background
    phoneFrame.style.backgroundImage = `url('${info.bg}')`;

    // Render Hourly Items (Next 24 hours)
    const hourlyList = document.getElementById('hourlyList');
    hourlyList.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const time = new Date(hourly.time[i]).getHours();
        const temp = Math.round(hourly.temperature_2m[i]);
        const code = hourly.weathercode[i];
        const iconClass = (weatherMap[code] || weatherMap[0]).icon;

        hourlyList.innerHTML += `
                    <div class="hourly-item">
                        <span>${i === 0 ? 'Now' : `${time}:00`}</span>
                        <i class="fa-solid ${iconClass}"></i>
                        <span>${temp}°</span>
                    </div>
                `;
    }

    // Render 7-Day Items
    const dailyList = document.getElementById('dailyList');
    dailyList.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : days[date.getDay()];
        const max = Math.round(daily.temperature_2m_max[i]);
        const min = Math.round(daily.temperature_2m_min[i]);
        const code = daily.weathercode[i];
        const iconClass = (weatherMap[code] || weatherMap[0]).icon;

        dailyList.innerHTML += `
                    <div class="daily-item">
                        <span class="day-name">${dayName}</span>
                        <i class="fa-solid ${iconClass} daily-icon"></i>
                        <div class="temp-bar-container">
                            <span>${min}°</span>
                            <div class="temp-bar">
                                <div class="temp-progress" style="left: 20%; width: 60%;"></div>
                            </div>
                            <span>${max}°</span>
                        </div>
                    </div>
                `;
    }
}

// Initial Load for Karachi
getWeatherData('Karachi');