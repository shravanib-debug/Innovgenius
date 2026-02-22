import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Optionally restricts by roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
 *   <Route element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>}>
 */
export default function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#e8722a] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#a89888] text-sm">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#f1ebe4] mb-2">Access Denied</h1>
                    <p className="text-[#a89888]">Your role ({user?.role}) does not have access to this page.</p>
                </div>
            </div>
        );
    }

    return children;
}
