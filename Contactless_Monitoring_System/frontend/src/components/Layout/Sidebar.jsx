import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ScanLine, UserPlus, Layers, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Entry', path: '/scanner', icon: <ScanLine size={20} /> },
        { name: 'Entry Logs', path: '/admin/logs', icon: <Users size={20} /> },
        { name: 'Register Students', path: '/admin/register-student', icon: <UserPlus size={20} /> },
        { name: 'Register Faculty', path: '/admin/register-faculty', icon: <UserPlus size={20} /> },
        { name: 'Institute', path: '/admin/institutions', icon: <Layers size={20} /> },
        { name: 'Pending Approvals', path: '/admin/approvals', icon: <UserCheck size={20} /> },
    ];

    return (
        <>
            <div
                className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white dark:bg-gray-800 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}>
                <div className="flex items-center justify-center mt-8 text-center">
                    <span className="text-2xl font-semibold text-gray-800 dark:text-white">Smart Campus</span>
                </div>

                <nav className="mt-10">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `flex items-center px-6 py-3 mt-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-l-4 border-indigo-600' : ''}`}
                        >
                            {item.icon}
                            <span className="mx-3">{item.name}</span>
                        </NavLink>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-6 py-3 mt-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400"
                    >
                        <LogOut size={20} />
                        <span className="mx-3">Logout</span>
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
