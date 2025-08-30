import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import CountryCard from "../components/CountryCard";
import WeatherCard from "../components/WeatherCard";
import AirQualityCard from "../components/AirQualityCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";

export default function Dashboard() {
  // Auth0 hooks
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading, 
    getAccessTokenSilently,
    loginWithRedirect,
    logout 
  } = useAuth0();

  // State management
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [stats, setStats] = useState(null);
  
  const navigate = useNavigate();

  // Fetch countries list with enhanced error handling
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,capital,population");
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const json = await res.json();
        const countryList = json
          .map(c => ({
            name: c.name.common,
            capital: c.capital?.[0] || "N/A",
            population: c.population || 0
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(countryList);
        setFilteredCountries(countryList);
        
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Failed to load countries list. Using fallback data.");
        
        // Fallback country list
        const fallbackCountries = [
          { name: "Sri Lanka", capital: "Colombo", population: 21919000 },
          { name: "United States", capital: "Washington D.C.", population: 331900000 },
          { name: "India", capital: "New Delhi", population: 1380000000 },
          { name: "Japan", capital: "Tokyo", population: 125800000 },
          { name: "Germany", capital: "Berlin", population: 83200000 }
        ];
        setCountries(fallbackCountries);
        setFilteredCountries(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.capital.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

  // Fetch user statistics
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserStats();
    }
  }, [isAuthenticated, user]);

  // In the fetchUserStats function, update to:
  const fetchUserStats = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await api.get("/records/stats", {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (err) {
      console.warn("Could not fetch user statistics:", err);
      // Set fallback stats if API is not available
      setStats({ totalRecords: 0, uniqueCountriesCount: 0 });
    }
  };

  // Enhanced data fetching with better error handling and validation
  const fetchData = async () => {
    if (!selectedCountry) {
      setError("Please select a country");
      return;
    }

    if (!isAuthenticated) {
      setError("Please log in to access this feature");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Get the selected country object
      const countryObj = countries.find(c => c.name === selectedCountry);
      if (!countryObj) {
        throw new Error("Selected country not found in the list");
      }

      // Step 1: Fetch country metadata from RestCountries API
      const countryRes = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(selectedCountry)}?fullText=true`
      );
      
      if (!countryRes.ok) {
        throw new Error(`Country API Error: ${countryRes.status} ${countryRes.statusText}`);
      }
      
      const countryData = await countryRes.json();
      const countryInfo = countryData[0];

      const metadata = {
        capital: countryInfo.capital?.[0] || countryObj.capital || "N/A",
        population: countryInfo.population || countryObj.population || "N/A",
        currency: Object.keys(countryInfo.currencies || {})[0] || "N/A",
        languages: Object.values(countryInfo.languages || {}),
        flag: countryInfo.flags?.svg || countryInfo.flags?.png || "",
        region: countryInfo.region || "N/A",
        subregion: countryInfo.subregion || "N/A"
      };

      // Step 2: Fetch weather data from OpenWeatherMap API
      let weather = { temperature: "N/A", humidity: "N/A", description: "N/A" };
      try {
        const apiKeyWeather = import.meta.env.VITE_OPENWEATHERMAP_KEY;
        if (!apiKeyWeather) {
          throw new Error("OpenWeatherMap API key not configured");
        }

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(metadata.capital)}&units=metric&appid=${apiKeyWeather}`
        );

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          weather = {
            temperature: Math.round(weatherData.main?.temp) || "N/A",
            humidity: weatherData.main?.humidity || "N/A",
            description: weatherData.weather?.[0]?.description || "N/A",
            feelsLike: Math.round(weatherData.main?.feels_like) || "N/A",
            pressure: weatherData.main?.pressure || "N/A"
          };
        } else {
          console.warn("Weather data not available for", metadata.capital);
        }
      } catch (weatherErr) {
        console.warn("Weather API error:", weatherErr);
      }

      // Step 3: Fetch air quality data
      let airQuality = { parameter: "N/A", value: "N/A", unit: "", status: "N/A" };
      try {
        const token = await getAccessTokenSilently();
        const airRes = await api.get(`/geo/airquality?city=${encodeURIComponent(metadata.capital)}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "x-api-key": import.meta.env.VITE_BACKEND_API_KEY 
          }
        });

        if (airRes.data.results && airRes.data.results.length > 0) {
          const air = airRes.data.results[0];
          airQuality = {
            parameter: air.parameter || "PM2.5",
            value: Math.round(air.value) || "N/A",
            unit: air.unit || "µg/m³",
            status: getAQIStatus(air.value)
          };
        }
      } catch (airErr) {
        console.warn("Air quality data not available:", airErr);
      }

      // Step 4: Aggregate all data
      const aggregatedData = {
        country: countryInfo.name.common,
        metadata,
        weather,
        airQuality,
        fetchedAt: new Date().toISOString(),
        userId: user?.sub // Include user ID for backend validation
      };

      setData(aggregatedData);
      setSuccess(`Successfully fetched data for ${selectedCountry}!`);
      
      // Auto-clear success message
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error("Data fetch error:", err);
      setError(`Failed to fetch data: ${err.message}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced save snapshot with authentication
  const saveSnapshot = async () => {
    if (!data) {
      setError("No data to save. Please fetch country data first.");
      return;
    }

    if (!isAuthenticated) {
      setError("Please log in to save snapshots");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = await getAccessTokenSilently();
      
      await api.post("/records", data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-api-key": import.meta.env.VITE_BACKEND_API_KEY,
          "Content-Type": "application/json"
        }
      });

      setSuccess("Snapshot saved successfully!");
      
      // Refresh user statistics
      await fetchUserStats();
      
      // Auto-clear success message
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error("Save snapshot error:", err);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 400) {
        setError("Invalid data format. Please try fetching data again.");
      } else {
        setError(`Failed to save snapshot: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Get AQI status based on value
  const getAQIStatus = (value) => {
    if (typeof value !== 'number') return 'Unknown';
    if (value <= 12) return 'Good';
    if (value <= 35) return 'Moderate';
    if (value <= 55) return 'Unhealthy for Sensitive';
    if (value <= 150) return 'Unhealthy';
    if (value <= 250) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Handle authentication
  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  // Show loading screen during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Initializing application..." />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">🌍 GeoInsight Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Explore countries with real-time weather and air quality data
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              🔐 Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">🌍 GeoInsight Dashboard</h1>
              {stats && (
                <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
                  <span>📊 {stats.totalRecords} saved records</span>
                  <span>🗺️ {stats.uniqueCountriesCount} countries explored</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <LoadingSpinner size="lg" message="Fetching country data..." />
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess("")} />}

        {/* Search and Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Select Country</h2>
          
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Country Selector */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="">Select a country</option>
              {filteredCountries.map((country, i) => (
                <option key={i} value={country.name}>
                  {country.name} - {country.capital}
                </option>
              ))}
            </select>
            <button
              onClick={fetchData}
              disabled={loading || !selectedCountry}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                loading || !selectedCountry
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {loading ? "Fetching..." : "Get Insights"}
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        {data && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <CountryCard 
                metadata={data.metadata} 
                country={data.country}
                className="hover:shadow-lg transition-shadow duration-200"
              />
              <WeatherCard 
                weather={data.weather} 
                capital={data.metadata.capital}
                className="hover:shadow-lg transition-shadow duration-200"
              />
              <AirQualityCard 
                airQuality={data.airQuality}
                className="hover:shadow-lg transition-shadow duration-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={saveSnapshot}
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                    saving
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {saving ? "💾 Saving..." : "💾 Save Snapshot"}
                </button>

                <button
                  onClick={() => navigate("/records")}
                  className="flex-1 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors duration-200"
                >
                  📜 View Saved Records
                </button>

                <button
                  onClick={() => {
                    setData(null);
                    setSelectedCountry("");
                    setError("");
                    setSuccess("");
                  }}
                  className="flex-1 px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors duration-200"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {!data && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Getting Started</h3>
            <p className="text-blue-700">
              Select a country from the dropdown above to view comprehensive data including 
              country information, current weather conditions, and air quality measurements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}