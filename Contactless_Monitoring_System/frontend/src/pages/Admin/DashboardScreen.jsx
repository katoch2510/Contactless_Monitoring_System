import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Clock, Activity, Building, ScanLine } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const DashboardScreen = () => {
    const [stats, setStats] = useState({
        totalVisitors: 0,
        pendingApprovals: 0,
        totalStudents: 0,
        activeEntries: 0,
    });

    const [charts, setCharts] = useState({
        studentsPerCollege: [],
        recentEntries: []
    });

    const [loading, setLoading] = useState(true);

    const token = JSON.parse(localStorage.getItem('userInfo'))?.token;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/dashboard/stats', config);

                setStats(data.kpis);
                setCharts(data.charts);
            } catch (err) {
                toast.error('Failed to load dashboard metrics');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    const statCards = [
        { title: 'Registered Students', value: stats.totalStudents, icon: <Building className="w-8 h-8 text-indigo-500" />, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { title: 'Registered Visitors', value: stats.totalVisitors, icon: <Users className="w-8 h-8 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: 'Pending Visitor Approvals', value: stats.pendingApprovals, icon: <Clock className="w-8 h-8 text-yellow-500" />, bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { title: 'Active Inside Campus', value: stats.activeEntries, icon: <Activity className="w-8 h-8 text-green-500" />, bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <div key={index} className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className={`p-4 rounded-full ${card.bg}`}>
                            {card.icon}
                        </div>
                        <div className="ml-5">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</h4>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Students & Recent Logs Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Campus Entry Activity (Last 7 Days)</h2>
                    {charts.recentEntries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={charts.recentEntries}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="date" tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="studentEntries" name="Student Entries" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="visitorEntries" name="Visitor Entries" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">No activity data for the past 7 days.</div>
                    )}
                </div>

                {/* Students Per College Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Student Distribution by College</h2>
                    {charts.studentsPerCollege.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={charts.studentsPerCollege}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {charts.studentsPerCollege.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">No college distribution data available.</div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ScanLine className="w-5 h-5 mr-2 text-indigo-500" /> Security Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <a href="/scanner" className="block p-5 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition group">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Launch Gate Terminal &rarr;</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Open the scanner interface for monitoring automated entry and manual bypasses.</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
