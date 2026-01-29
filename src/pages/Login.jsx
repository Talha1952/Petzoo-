import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">PETZO <span className="text-2xl">🐾</span></h1>
            <p className="text-gray-500 mb-8">Sales System</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Enter username"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-lg mt-4">
                    LOGIN
                </button>
            </form>
        </div>
    );
}
