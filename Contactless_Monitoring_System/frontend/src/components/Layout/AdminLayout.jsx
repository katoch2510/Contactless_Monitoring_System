import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Minimal auth check for layout wrapper
    const isAuthenticated = localStorage.getItem('userInfo');
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
