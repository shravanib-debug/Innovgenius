import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';

function DashboardLayout() {
    return (
        <div className="flex min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
            <DashboardSidebar />
            <main className="flex-1 flex flex-col min-h-screen transition-all duration-250"
                style={{ marginLeft: '280px' }}>
                <DashboardNavbar />
                <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
