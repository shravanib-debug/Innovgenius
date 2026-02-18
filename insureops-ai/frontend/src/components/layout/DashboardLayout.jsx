import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#080808]">
            <Sidebar />
            {/* Main content — flex-1 fills remaining space after sidebar */}
            <main className="flex-1 p-6 overflow-auto min-h-screen relative">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
