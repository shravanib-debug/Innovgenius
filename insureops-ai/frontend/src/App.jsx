import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AIMonitoringPage from './pages/AIMonitoringPage'
import Section1Page from './pages/Section1Page'
import Section2Page from './pages/Section2Page'
import TracesPage from './pages/TracesPage'
import TraceDetailPage from './pages/TraceDetailPage'
import AlertsPage from './pages/AlertsPage'
import CompliancePage from './pages/CompliancePage'
import AgentConsolePage from './pages/AgentConsolePage'
import ClaimsListPage from './pages/ClaimsListPage'
import ClaimDetailPage from './pages/ClaimDetailPage'

import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* All roles */}
          <Route index element={<DashboardPage />} />
          <Route path="ai-monitoring" element={<AIMonitoringPage />} />
          <Route path="section1" element={<Section1Page />} />
          <Route path="section2" element={<Section2Page />} />
          <Route path="traces" element={<TracesPage />} />
          <Route path="traces/:traceId" element={<TraceDetailPage />} />
          <Route path="llm-logs" element={<Section2Page />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="compliance" element={
            <ProtectedRoute roles={['compliance_officer', 'admin']}>
              <CompliancePage />
            </ProtectedRoute>
          } />

          {/* Operations Manager + Admin only */}
          <Route path="agents" element={
            <ProtectedRoute roles={['operations_manager', 'admin']}>
              <AgentConsolePage />
            </ProtectedRoute>
          } />
          <Route path="claims" element={
            <ProtectedRoute roles={['operations_manager', 'admin']}>
              <ClaimsListPage />
            </ProtectedRoute>
          } />
          <Route path="claims/:claimId" element={
            <ProtectedRoute roles={['operations_manager', 'admin']}>
              <ClaimDetailPage />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<DashboardPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
