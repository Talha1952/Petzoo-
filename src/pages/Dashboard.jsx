import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext'; // Import Auth
import { StatCard } from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { printInvoice } from '../lib/printUtils';
import { Search, Filter, Printer, Eye, EyeOff, Trash2 } from 'lucide-react'; // Added Trash2

export default function Dashboard() {
    const { invoices, products, deleteInvoice } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showStats, setShowStats] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // --- COMPUTED STATS ---
    const stats = useMemo(() => {
        const now = new Date();
        const todayDate = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let todaySales = 0;
        let todayCash = 0;
        let totalReceivable = 0; // Total Udhar Pending
        let monthRevenue = 0;
        let monthProfit = 0;

        const productMap = new Map(products.map(p => [p.id, p]));

        invoices.forEach(inv => {
            const d = new Date(inv.date);
            const isToday = d.getDate() === todayDate && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;

            if (isToday) {
                todaySales += inv.total;
                const historyToday = (inv.history || []).filter(h => {
                    const hd = new Date(h.date);
                    return hd.getDate() === todayDate && hd.getMonth() === currentMonth && hd.getFullYear() === currentYear;
                });
                todayCash += historyToday.reduce((sum, h) => sum + h.amount, 0);
            }

            // Receivable is based on current remaining
            totalReceivable += inv.remaining;

            if (isThisMonth) {
                monthRevenue += inv.total;

                // Calculate Profit for this invoice
                inv.items.forEach(item => {
                    const qty = item.totalKg || item.qty || 0;
                    const sellPrice = item.pricePerKg || item.price || 0;

                    // Try to get buy price from item, fallback to current product buy price
                    let buyPrice = item.buy;
                    if (buyPrice === undefined || buyPrice === null) {
                        const currentProd = productMap.get(item.id);
                        if (currentProd) buyPrice = currentProd.buy;
                    }
                    buyPrice = buyPrice || 0;

                    const itemProfit = (sellPrice - buyPrice) * qty;
                    monthProfit += itemProfit;
                });
            }
        });

        const lowStockCount = products.filter(p => {
            let threshold = 5;
            if (p.unitLabel === 'Kg' || p.category === 'Loose Items') threshold = 10;
            else if (p.unitLabel === 'Bag') threshold = 3;
            else threshold = 5;

            if (p.lowStockThreshold) threshold = p.lowStockThreshold;

            return p.stock <= threshold;
        }).length;

        return { todaySales, todayCash, totalReceivable, lowStockCount, monthRevenue, monthProfit };
    }, [invoices, products]);

    // --- TRANSACTIONS LIST ---
    // --- TRANSACTIONS LIST (CURRENT MONTH ONLY) ---
    const transactions = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. Filter: Only Current Month
        let list = invoices.filter(inv => {
            const d = new Date(inv.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // 2. Sort
        list.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 3. Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(t =>
                t.customer.name.toLowerCase().includes(lower) ||
                t.id.toString().includes(lower) ||
                (t.customer.phone && t.customer.phone.includes(lower))
            );
        }

        // 4. Filter Status
        if (filterStatus !== 'All') {
            if (filterStatus === 'Paid') list = list.filter(t => t.remaining <= 0);
            else if (filterStatus === 'Credit') list = list.filter(t => t.remaining > 0);
        }

        return list; // Return full list for current month (or slice if really large, but usually fine)
    }, [invoices, searchTerm, filterStatus]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <p className="text-sm text-gray-500">Overview & Real-time Sales</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-sm font-bold text-gray-700">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-gray-100 px-3 py-1 rounded-full"
                    >
                        {showStats ? <><EyeOff size={14} /> Hide Details</> : <><Eye size={14} /> Show Details</>}
                    </button>
                </div>
            </div>

            {/* STATS GRID */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        title="Today's Sales"
                        value={`Rs ${stats.todaySales.toLocaleString()}`}
                        color="blue"
                        subValue="Total Invoice Value"
                    />
                    <StatCard
                        title="Today's Cash"
                        value={`Rs ${stats.todayCash.toLocaleString()}`}
                        color="green"
                        subValue="Cash In Hand"
                    />
                    <StatCard
                        title="Total Receivable"
                        value={`Rs ${stats.totalReceivable.toLocaleString()}`}
                        color="orange"
                        onClick={() => navigate('/udhar')}
                        subValue="Pending Udhar"
                    />
                    <StatCard
                        title="Monthly Profit"
                        value={`Rs ${stats.monthProfit.toLocaleString()}`}
                        color="purple"
                        subValue="Est. Net Profit"
                    />
                    <StatCard
                        title="Low Stock Items"
                        value={stats.lowStockCount}
                        color="red"
                        onClick={() => navigate('/inventory?filter=low')}
                        subValue="Click to view details"
                    />
                </div>
            )}

            {/* RECENT TRANSACTIONS */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-700 text-lg">Invoices</h3>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{transactions.length}</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Invoice #, Name..."
                                className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary w-full sm:w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Paid">Paid / Cleared</option>
                            <option value="Credit">Pending Credit</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">Invoice #</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-right text-green-600">Paid</th>
                                <th className="px-4 py-3 text-right text-red-600">Remaining</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length > 0 ? transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">#{t.id}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(t.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-800">{t.customer.name}</div>
                                        {t.userName && <div className="text-xs text-gray-400">Sold by: {t.userName}</div>}
                                        <div className="text-xs text-gray-500">{t.customer.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 capitalize text-gray-600">{t.paymentType}</td>
                                    <td className="px-4 py-3 text-right font-bold">
                                        {showStats ? `Rs ${t.total.toLocaleString()}` : '****'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-600">
                                        {showStats ? `Rs ${t.paid.toLocaleString()}` : '****'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600">
                                        {t.remaining > 0 ? (showStats ? `Rs ${t.remaining.toLocaleString()}` : '****') : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-bold inline-block min-w-[80px]",
                                            t.remaining <= 0
                                                ? "bg-green-100 text-green-700 border border-green-200"
                                                : "bg-orange-100 text-orange-700 border border-orange-200"
                                        )}>
                                            {t.remaining <= 0 ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                                        <button onClick={() => printInvoice(t)} className="p-1 text-gray-500 hover:text-gray-800" title="Print Invoice">
                                            <Printer size={16} />
                                        </button>

                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => deleteInvoice(t.id)} // deleteInvoice has its own confirm
                                                className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded"
                                                title="Delete Invoice (Admin Only)"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center text-gray-400">
                                        No invoices found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
