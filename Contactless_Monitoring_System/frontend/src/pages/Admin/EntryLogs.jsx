import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { LogIn, LogOut, Search } from 'lucide-react';

const EntryLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            const { token } = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data } = await axios.get('/api/qr/logs', config);
            setLogs(data);
        } catch (err) {
            toast.error('Failed to load entry logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.person_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.person_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Entry Logs</h1>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Person Details</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Entry Time</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Exit Time</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Gate</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {filteredLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.person_id?.name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{log.person_id?.email || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.person_type === 'Student' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {log.person_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                                            <LogIn className="w-4 h-4 mr-2 text-green-500" />
                                            {format(new Date(log.entry_time), 'PPp')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {log.exit_time ? (
                                            <div className="flex items-center text-sm text-gray-900 dark:text-gray-300">
                                                <LogOut className="w-4 h-4 mr-2 text-red-500" />
                                                {format(new Date(log.exit_time), 'PPp')}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                Inside Campus
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.gate_location}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredLogs.length === 0 && (
                        <div className="text-center p-8 text-gray-500 dark:text-gray-400 text-sm">
                            No logs found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntryLogs;
