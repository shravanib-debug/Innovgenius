import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { WebSocketProvider } from '../../contexts/WebSocketProvider';
import AlertToast from '../shared/AlertToast';

const DashboardLayout = () => {
    return (
        <WebSocketProvider>
            <div className="flex min-h-screen bg-[#080808]">
                <Sidebar />
                {/* Main content — flex-1 fills remaining space after sidebar */}
                <main className="flex-1 p-6 overflow-auto min-h-screen relative">
                    <Outlet />
                </main>
            </div>
            {/* Real-time alert toasts */}
            <AlertToast />
        </WebSocketProvider>
    );
};

export default DashboardLayout;

