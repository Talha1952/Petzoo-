import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

export function AppLayout() {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-auto relative">
                <div className="p-6 h-full pb-20"> {/* pb-20 for safe space */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
