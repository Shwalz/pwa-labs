import { useEffect, useState } from 'react';
import { fetchWeather } from './api/fetchWeather.js';
import './App.css';

// kierunek wiatru w stopniach -> strona świata
const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function windDirection(deg) {
  return DIRECTIONS[Math.round(deg / 45) % 8];
}

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return; // puste pole - nic nie robimy
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeather(query);
      setWeather(data);
      setQuery(''); // czyścimy pole po udanym wyszukiwaniu
    } catch (err) {
      setWeather(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <form onSubmit={search}>
        <input
          type="text"
          className="search"
          placeholder="Wpisz miasto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {loading && <p className="message">Pobieranie danych...</p>}
      {error && <p className="message error">{error}</p>}
      {!online && <p className="message">Brak połączenia — pokazuję ostatnio pobrane dane.</p>}

      {weather && (
        <div className="city">
          <h2 className="city-name">
            <span>{weather.name}</span>
            <sup>{weather.sys.country}</sup>
          </h2>

          <div className="city-temp">
            {Math.round(weather.main.temp)}
            <sup>&deg;C</sup>
          </div>

          <div className="info">
            <img
              className="city-icon"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p>{weather.weather[0].description}</p>
            <p>Ciśnienie: {weather.main.pressure} hPa</p>
            <p>Wilgotność: {weather.main.humidity}%</p>
            <p>
              Wiatr: {weather.wind.speed} m/s
              {weather.wind.gust !== undefined && `, w porywach ${weather.wind.gust} m/s`}
            </p>
            <p>
              Kierunek wiatru: {weather.wind.deg}&deg; ({windDirection(weather.wind.deg)})
            </p>
            <p>
              Pomiar o godzinie{' '}
              {new Date(weather.dt * 1000).toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
