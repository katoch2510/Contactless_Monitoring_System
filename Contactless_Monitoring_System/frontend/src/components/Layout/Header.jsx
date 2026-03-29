import React from 'react';
import { Menu, UserCircle } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b-4 border-indigo-600">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="text-gray-500 focus:outline-none lg:hidden"
                >
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex items-center">
                <div className="relative flex items-center space-x-3">
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                        {userInfo.name || 'Admin'}
                    </span>
                    <UserCircle size={32} className="text-gray-600 dark:text-gray-300" />
                </div>
            </div>
        </header>
    );
};

export default Header;
