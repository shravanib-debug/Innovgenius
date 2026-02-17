import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import OverviewPage from './pages/OverviewPage';
import {
  Activity,
  Bot,
  FileSearch,
  Bell,
  Terminal
} from 'lucide-react';

// Placeholder pages for future phases
function PlaceholderPage({ icon: Icon, title, description }) {
  return (
    <div className="page-container">
      <div className="placeholder-page">
        <div className="placeholder-icon">
          <Icon size={36} />
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route
            path="/section1"
            element={
              <PlaceholderPage
                icon={Activity}
                title="AI Application Monitoring"
                description="Prompt quality, response accuracy, latency, API rates, cost tracking, and model drift detection. Coming in Phase 5."
              />
            }
          />
          <Route
            path="/section2"
            element={
              <PlaceholderPage
                icon={Bot}
                title="LLM Agent Monitoring"
                description="Human approval rates, agent performance, decision accuracy, tool usage, escalation frequency, and compliance. Coming in Phase 6."
              />
            }
          />
          <Route
            path="/traces"
            element={
              <PlaceholderPage
                icon={FileSearch}
                title="Trace Explorer"
                description="Interactive execution trace viewer with full audit trail of every agent decision. Coming in Phase 7."
              />
            }
          />
          <Route
            path="/alerts"
            element={
              <PlaceholderPage
                icon={Bell}
                title="Alert Center"
                description="Threshold-based alerting with real-time notifications for anomalies and compliance violations. Coming in Phase 8."
              />
            }
          />
          <Route
            path="/agents"
            element={
              <PlaceholderPage
                icon={Terminal}
                title="Agent Console"
                description="Manually trigger insurance AI agents and view results inline with trace links. Coming in Phase 9."
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
