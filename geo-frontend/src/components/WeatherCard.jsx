export default function WeatherCard({ weather, capital }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300">
      <h2 className="text-xl font-semibold mb-3 text-yellow-600">Weather in {capital}</h2>
      <p><span className="font-semibold">Temperature:</span> {weather.temperature} °C</p>
      <p><span className="font-semibold">Humidity:</span> {weather.humidity}%</p>
      <p><span className="font-semibold">Condition:</span> {weather.description}</p>
    </div>
  );
}
