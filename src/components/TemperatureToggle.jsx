const TemperatureToggle = () => {
  return (
    <div className="bg-red/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 shadow-lg">
      <div className="flex items-center">
        <button
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300`}
        >
          °C
        </button>
        <button
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300`}
        >
          °F
        </button>
      </div>
    </div>
  );
};

export default TemperatureToggle;