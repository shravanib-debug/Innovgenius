import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import OverviewPage from './pages/OverviewPage';

// Placeholder pages
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Coming soon</p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Dashboard with sidebar layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="section1" element={<PlaceholderPage title="AI Application Monitoring" />} />
        <Route path="section2" element={<PlaceholderPage title="LLM Agent Monitoring" />} />
        <Route path="traces" element={<PlaceholderPage title="Trace Explorer" />} />
        <Route path="alerts" element={<PlaceholderPage title="Alerts" />} />
        <Route path="agents" element={<PlaceholderPage title="Agent Console" />} />
      </Route>
    </Routes>
  );
}

export default App;
