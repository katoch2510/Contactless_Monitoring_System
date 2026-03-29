import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, X, UserSearch } from 'lucide-react';
import { format } from 'date-fns';

const PendingApprovals = () => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const { token } = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data } = await axios.get('/api/visitors/pending', config);
            setVisitors(data);
        } catch (err) {
            toast.error('Failed to load pending visitors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const { token } = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`/api/visitors/${id}/status`, { status }, config);
            toast.success(`Visitor ${status} successfully!`);
            // Update local state instead of refetching for better UX
            setVisitors(visitors.filter(v => v._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>

            {visitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <UserSearch className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Pending Approvals</h3>
                    <p className="text-gray-500 dark:text-gray-400">All caught up! There are no visitors waiting for entry approval.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Visitor Details</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Purpose</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Date</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {visitors.map((visitor) => (
                                    <tr key={visitor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 relative">
                                                    {visitor.photo_base64 ? (
                                                        <img className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" src={visitor.photo_base64} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs text-center">{visitor.name.charAt(0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{visitor.name}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{visitor.phone}</span>
                                                    <span className="text-xs text-indigo-500 dark:text-indigo-400">{visitor.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={visitor.purpose}>
                                                    {visitor.purpose}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(visitor.visit_date), 'PPp')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(visitor._id, 'Approved')}
                                                    className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                                    title="Approve"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(visitor._id, 'Rejected')}
                                                    className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                                    title="Reject"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;
