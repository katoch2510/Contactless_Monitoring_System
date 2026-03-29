import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await axios.post('/api/auth/login', { email, password });

            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Login Successful');
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-t-8 border-indigo-600">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Portal</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to manage campus entry</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 transition-colors"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
