import { Loader } from "lucide-react";
import backgroundImage1 from "./assets/bg_2.jpg";
import SearchBar from "./components/SearchBar";
import TemperatureToggle from "./components/TemperatureToggle";
function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40">
          <div className="absolute inset-0 bg-black-20"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 min-w-screen">
          <div className="max-w-7xl mx-auto">
            {/* header section */}
            <div className="text-center mb-12">
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl tracking-tight">
                  Weather{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Pro
                  </span>
                </h1>
                <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                  Experience weather like never before with real-time data,
                  beautiful visuals, and precise forecasts for any location
                  worldwide.
                </p>
              </div>
              <div className="flex flex-col lg:flex items-center justify-center space-y-6 lg:space-y-8 lg:space-x-6 mb-12">
                <SearchBar />
                <TemperatureToggle />
              </div>
            </div>
            {/*Main Content  */}
            <div className="space-y-8">
              {/* Conditional Rendering */}
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mt-20">
                  <Loader />
                  <p className="text-white/80 text-center
                  mt-4 font-medium">Fetching latest weather data.....</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
