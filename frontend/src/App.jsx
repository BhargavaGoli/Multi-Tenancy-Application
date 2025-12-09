import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ConnectionTest from './pages/ConnectionTest';

// Helper to check if we are on a subdomain
const isSubdomain = () => {
  const host = window.location.host; // e.g., "acme.localhost:5174" or "localhost:5174"

  // Handle localhost
  if (host.includes('localhost')) {
    const parts = host.split('.');
    // localhost:5174 -> ['localhost:5174'] (length 1)
    // acme.localhost:5174 -> ['acme', 'localhost:5174'] (length 2)
    return parts.length > 1;
  }

  // Handle 127.0.0.1
  if (host.includes('127.0.0.1')) {
    const parts = host.split('.');
    // 127.0.0.1:5174 -> 4 parts
    // acme.127.0.0.1:5174 -> 5 parts
    return parts.length > 4;
  }

  // Handle production (e.g., projecthub.com)
  const parts = host.split('.');
  // projecthub.com -> 2 parts
  // acme.projecthub.com -> 3 parts
  return parts.length > 2;
};

const RootRoute = () => {
  if (isSubdomain()) {
    return <Dashboard />;
  }
  return <Home />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Intelligent Root Route */}
          <Route path="/" element={<RootRoute />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/test-connection" element={<ConnectionTest />} />

          {/* Dashboard Routes - accessible via /dashboard or root on subdomain */}
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
