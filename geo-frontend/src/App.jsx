import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";

function App() {
  return (
    <Router>
      {/* Top Navigation */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl">GeoInsight</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <Link to="/records" className="hover:underline">Records</Link>
        </div>
      </nav>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/records" element={<Records />} />
      </Routes>
    </Router>
  );
}

export default App;
