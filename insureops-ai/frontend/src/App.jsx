import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AIMonitoringPage from './pages/AIMonitoringPage'
import Section1Page from './pages/Section1Page'
import Section2Page from './pages/Section2Page'
import TracesPage from './pages/TracesPage'
import TraceDetailPage from './pages/TraceDetailPage'
import AlertsPage from './pages/AlertsPage'
import AgentConsolePage from './pages/AgentConsolePage'
import ClaimsListPage from './pages/ClaimsListPage'
import ClaimDetailPage from './pages/ClaimDetailPage'

import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="ai-monitoring" element={<AIMonitoringPage />} />
        <Route path="section1" element={<Section1Page />} />
        <Route path="section2" element={<Section2Page />} />
        <Route path="traces" element={<TracesPage />} />
        <Route path="traces/:traceId" element={<TraceDetailPage />} />
        <Route path="llm-logs" element={<Section2Page />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="agents" element={<AgentConsolePage />} />
        <Route path="claims" element={<ClaimsListPage />} />
        <Route path="claims/:claimId" element={<ClaimDetailPage />} />
        {/* Catch-all for dashboard subpages */}
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
