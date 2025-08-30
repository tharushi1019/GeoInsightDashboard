import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import CountryCard from "../components/CountryCard";
import WeatherCard from "../components/WeatherCard";
import AirQualityCard from "../components/AirQualityCard";

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState("");
  const [undoData, setUndoData] = useState(null); // store record temporarily
  const navigate = useNavigate();

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/records", {
        headers: { "x-api-key": import.meta.env.VITE_BACKEND_API_KEY },
      });
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch records from backend.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = (rec) => {
    setDeleting(rec._id);
    setUndoData(rec);
    setRecords((prev) => prev.filter((r) => r._id !== rec._id));
    setToast(`Snapshot deleted! Undo?`);
    
    // Start 5-second timer for actual deletion
    const timer = setTimeout(async () => {
      if (!undoData) return; // if user already undid
      try {
        await api.delete(`/records/${rec._id}`, {
          headers: { "x-api-key": import.meta.env.VITE_BACKEND_API_KEY },
        });
        setUndoData(null);
        setToast(""); // hide toast
      } catch (err) {
        console.error(err);
        setError("Failed to delete snapshot from backend.");
      }
      setDeleting(null);
    }, 5000);

    // If user clicks Undo
    const undo = () => {
      clearTimeout(timer);
      setRecords((prev) => [rec, ...prev]);
      setUndoData(null);
      setToast("Deletion undone!");
      setDeleting(null);
    };

    // Attach undo function to toast
    setToast({ message: "Snapshot deleted! Undo?", action: undo });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="flex justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-bold text-purple-600">📚 Saved Snapshots</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchRecords}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded shadow-lg z-50 flex items-center gap-4">
          <span>{toast.message || toast}</span>
          {toast.action && (
            <button
              onClick={toast.action}
              className="underline text-sm hover:text-gray-200"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* No records */}
      {!loading && records.length === 0 && (
        <p className="text-gray-500">No snapshots saved yet.</p>
      )}

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((rec) => (
          <div key={rec._id} className="bg-white p-4 rounded-xl shadow-md relative">
            <h2 className="text-xl font-semibold text-blue-600 mb-1">{rec.country || "Unknown Country"}</h2>
            {rec.createdAt && (
              <p className="text-gray-400 text-sm mb-2">
                Saved: {new Date(rec.createdAt).toLocaleString()}
              </p>
            )}
            <CountryCard metadata={rec.metadata || {}} />
            <WeatherCard weather={rec.weather || {}} capital={rec.metadata?.capital || "N/A"} />
            <AirQualityCard airQuality={rec.airQuality || { parameter: "N/A", value: "N/A", unit: "" }} />

            <button
              onClick={() => handleDelete(rec)}
              disabled={deleting === rec._id}
              className={`absolute top-2 right-2 px-2 py-1 text-white rounded ${
                deleting === rec._id ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {deleting === rec._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
