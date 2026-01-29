import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, LogOut, User, Users, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export function Sidebar({ className }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className={cn("w-64 bg-dark text-white flex flex-col h-full", className)}>
            <div className="p-5 border-b border-gray-800 bg-black/20 flex justify-center">
                <img src="/src/assets/logo-orange.png" alt="Petzo Logo" className="h-10 w-auto object-contain mix-blend-screen" />
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {user?.role === 'admin' && (
                        <>
                            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                            <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" />
                            <NavItem to="/reports/profit" icon={<FileText size={20} />} label="Reports / History" />
                            <NavItem to="/users" icon={<Users size={20} />} label="Manage Staff" />
                        </>
                    )}
                    <NavItem to="/udhar" icon={<CreditCard size={20} />} label="Udhar / Credit" />
                    <NavItem to="/pos" icon={<ShoppingCart size={20} />} label="Point of Sale" />
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-800 bg-black/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gray-700 p-2 rounded-full">
                        <User size={20} />
                    </div>
                    <div>
                        <div className="font-semibold text-sm">{user?.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors p-2 rounded text-sm text-gray-300"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <li>
            <NavLink
                to={to}
                className={({ isActive }) => cn(
                    "flex items-center gap-3 px-5 py-3 transition-all border-l-4",
                    isActive
                        ? "bg-primary/10 border-primary text-primary font-medium"
                        : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                )}
            >
                {icon}
                <span>{label}</span>
            </NavLink>
        </li>
    );
}
