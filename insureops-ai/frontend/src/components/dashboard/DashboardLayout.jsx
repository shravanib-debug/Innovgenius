import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[--color-bg-primary] text-[--color-text-primary] overflow-hidden">
            <Sidebar />
            {/* Main content — offset by sidebar width (240px) */}
            <main className="ml-[240px] flex-1 overflow-y-auto overflow-x-hidden">
                <div className="relative min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
