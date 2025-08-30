import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      {/* Top Navigation - Only show when authenticated */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Separate component for authenticated content
function AppContent() {
  return (
    <>
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl">GeoInsight</h1>
        <div className="space-x-4">
          <a href="/" className="hover:underline">Dashboard</a>
          <a href="/records" className="hover:underline">Records</a>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/records" element={<Records />} />
      </Routes>
    </>
  );
}

export default App;