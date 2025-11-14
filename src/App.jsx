import { useState } from "react";
import WeatherBackground from "./components/WeatherBackground";

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("C")

  const API_KEY = "85fb4ddd5585cf07d535bd7b4614e384"
  // https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid={API_KEY}&units=metric
  
  // https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}

  // this function check weather exsite then return an object
  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 > weather.weather.sunset,
    };

  return (
    <div className="min-h-screen">
      <WeatherBackground condition={getWeatherCondition()} />
      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10 ">
          <h1 className="text-4xl font-semibold text-center mb-6 ">
            Weather App
          </h1>

          {weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter City or Country (min 3 letters)"  className="mb-4 p-3 border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-300"/>
              {suggestion.length > 0 && (
                 <div className="absolute top-12 left-0 bg-transparent shadow-md rounded z-10 ">
                    {suggestion.map((s) => (
                      <button type="button" key={`${s.lat}-${s.lon}`} 
                      onClick={()=> fetchWeatherData(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid={API_KEY}&units=metric`
                        `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ``}`
                      )} className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-full w-full transition-colors" >
                          {s.name}, {s.country}{s.state && `, ${s.state}`}
                      </button>
                    ))}
                  </div>
                  )}
                  <button type="submit" className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                  Get Weather
                  </button>
            </form>
          ) : (
            <div className="text-center mt-6 transition-opacity duration-500">
                <button onClick={() => { setWeather(null); setCity('')}}
                className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
                  >
                  New Search
                </button>

                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold ">
                      {weather.name}
                    </h2>
                    <button onClick={() => setUnit(u => u === 'C' ? 'F' : 'C' )}>

                    </button>
                </div>

            </div>
          )


        </div>
      </div>
    </div>
  );
};

export default App;
