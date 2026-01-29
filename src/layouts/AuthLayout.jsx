import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthLayout() {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (user) return <Navigate to={user.role === 'admin' ? "/dashboard" : "/pos"} replace />;

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-primary to-[#81c784]">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-8">
                <Outlet />
            </div>
        </div>
    );
}
