import { useState, useEffect } from "react";
import api from "../api";
import CountryCard from "../components/CountryCard";
import WeatherCard from "../components/WeatherCard";
import AirQualityCard from "../components/AirQualityCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch country list once
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name");
        if (!res.ok) throw new Error("Failed to fetch countries");
        const json = await res.json();
        const sorted = json.map(c => c.name.common).sort();
        setCountries(sorted);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setCountries(["Sri Lanka", "United States", "India", "China", "Germany"]);
      }
    };
    fetchCountries();
  }, []);

  const fetchData = async () => {
    if (!selectedCountry) return setError("Please select a country");
    setLoading(true);
    setError("");

    try {
      // RestCountries
      const countryRes = await fetch(
        `https://restcountries.com/v3.1/name/${selectedCountry}?fullText=true`
      );
      if (!countryRes.ok) throw new Error("Country not found");
      const countryData = await countryRes.json();
      const countryInfo = countryData[0];

      const metadata = {
        capital: countryInfo.capital?.[0] || "N/A",
        population: countryInfo.population || "N/A",
        currency: Object.keys(countryInfo.currencies || {})[0] || "N/A",
        languages: Object.values(countryInfo.languages || {}),
        flag: countryInfo.flags?.svg || "",
      };

      // OpenWeatherMap
      const apiKeyWeather = import.meta.env.VITE_OPENWEATHERMAP_KEY;
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${metadata.capital}&units=metric&appid=${apiKeyWeather}`
      );
      const weatherData = await weatherRes.json();
      const weather = {
        temperature: weatherData.main?.temp || "N/A",
        humidity: weatherData.main?.humidity || "N/A",
        description: weatherData.weather?.[0]?.description || "N/A",
      };

      // OpenAQ via backend proxy to avoid CORS
      let airQuality = { parameter: "N/A", value: "N/A", unit: "" };
      try {
        const airRes = await fetch(`/api/geo/airquality?city=${metadata.capital}`);
        const airData = await airRes.json();
        if (airData.results && airData.results.length > 0) {
          const air = airData.results[0];
          airQuality = { parameter: air.parameter, value: air.value, unit: air.unit };
        }
      } catch (err) {
        console.warn("Air quality data not available:", err);
      }

      setData({ country: countryInfo.name.common, metadata, weather, airQuality });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Check API keys or country name.");
      setData(null);
    }

    setLoading(false);
  };

  const saveSnapshot = async () => {
    if (!data) return setError("No data to save");
    setSaving(true);
    setError("");

    try {
      await api.post("/records", data, {
        headers: { "x-api-key": import.meta.env.VITE_BACKEND_API_KEY },
      });
      alert("Snapshot saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save snapshot!");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">🌍 GeoInsight Dashboard</h1>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      )}

      {/* Country Selector */}
      <div className="flex gap-2 mb-6 max-w-md">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="flex-1 p-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select a country</option>
          {countries.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={fetchData}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
        >
          {loading ? "Fetching..." : "Fetch Data"}
        </button>
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Dashboard Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CountryCard metadata={data.metadata} />
          <WeatherCard weather={data.weather} capital={data.metadata.capital} />
          <AirQualityCard airQuality={data.airQuality} />
        </div>
      )}

      {/* Save Snapshot */}
      {data && (
        <div className="mt-6 flex gap-2">
          <button
            onClick={saveSnapshot}
            disabled={saving}
            className={`px-6 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {saving ? "Saving..." : "Save Snapshot"}
          </button>

          {/* View records */}
          <button
            onClick={() => navigate("/records")}
            className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            View Saved Snapshots
          </button>
        </div>
      )}
    </div>
  );
}
