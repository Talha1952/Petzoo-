import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, TrendingUp, DollarSign, Package, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { printInvoice } from '../lib/printUtils';

export default function Reports() {
    const { invoices, products } = useData();
    const navigate = useNavigate();

    // View State: 'months' | 'details'
    const [view, setView] = useState('months');
    const [selectedMonth, setSelectedMonth] = useState(null);

    // --- DATA PROCESSING (FLAT MONTHS) ---
    const monthsData = useMemo(() => {
        const monthsMap = {};

        invoices.forEach(inv => {
            const d = new Date(inv.date);
            const year = d.getFullYear(); // e.g., 2026
            const monthIndex = d.getMonth(); // 0-11
            const monthKey = `${year}-${monthIndex}`; // Unique Key

            if (!monthsMap[monthKey]) {
                const monthName = d.toLocaleString('default', { month: 'long' });
                monthsMap[monthKey] = {
                    key: monthKey,
                    year: year,
                    monthName: monthName,
                    fullLabel: `${monthName} ${year}`,
                    sortValue: d.getTime(), // Approximate for sorting (start of monthish)
                    sales: 0,
                    profit: 0,
                    itemsMap: {},
                    invoices: []
                };
            }

            const mData = monthsMap[monthKey];
            mData.sales += inv.total;
            mData.invoices.push(inv);

            // Calculate Profit & Item Counts
            const productMap = new Map(products.map(p => [p.id, p]));

            inv.items.forEach(item => {
                const qty = item.totalKg || item.qty || 0;
                const sellPrice = item.pricePerKg || item.price || 0;

                let buyPrice = item.buy;
                if (buyPrice === undefined || buyPrice === null) {
                    const currentProd = productMap.get(item.id);
                    if (currentProd) buyPrice = currentProd.buy;
                }
                buyPrice = buyPrice || 0;

                const profit = (sellPrice - buyPrice) * qty;
                mData.profit += profit;

                // Track Item Popularity
                if (!mData.itemsMap[item.name]) mData.itemsMap[item.name] = 0;
                mData.itemsMap[item.name] += qty;
            });
        });

        // Convert Map to Array & Sort Descending (Newest First)
        return Object.values(monthsMap).sort((a, b) => {
            // Sort by Year desc, then Month desc
            const [yA, mA] = a.key.split('-').map(Number);
            const [yB, mB] = b.key.split('-').map(Number);
            if (yA !== yB) return yB - yA;
            return mB - mA;
        }).map(m => {
            // Find Top Item
            let topItem = 'None';
            let maxQty = 0;
            Object.entries(m.itemsMap).forEach(([name, qty]) => {
                if (qty > maxQty) {
                    maxQty = qty;
                    topItem = name;
                }
            });
            return { ...m, topItem, topItemQty: maxQty };
        });

    }, [invoices, products]);

    // --- NAVIGATION ---
    const handleMonthClick = (m) => {
        setSelectedMonth(m);
        setView('details');
    };

    const handleBack = () => {
        if (view === 'details') setView('months');
        else navigate('/dashboard');
    };

    // --- VIEWS ---

    // 1. MONTHS GRID (Main View)
    if (view === 'months') {
        return (
            <div>
                <Header title="Monthly Reports" onBack={handleBack} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthsData.map(m => (
                        <div key={m.key} onClick={() => handleMonthClick(m)} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer hover:border-primary transition-all group">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Calendar size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">{m.fullLabel}</h3>
                                </div>
                                <ChevronRight className="text-gray-400" size={18} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-green-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Revenue</div>
                                    <div className="font-bold text-green-700">Rs {m.sales.toLocaleString()}</div>
                                </div>
                                <div className="bg-purple-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">Profit</div>
                                    <div className="font-bold text-purple-700">Rs {m.profit.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <TrendingUp size={16} className="text-orange-500" />
                                <span className="text-xs">Top:</span>
                                <span className="font-bold truncate flex-1" title={m.topItem}>{m.topItem}</span>
                                <span className="text-xs bg-white px-1 rounded border">x{m.topItemQty}</span>
                            </div>
                            <div className="mt-2 text-[10px] text-center text-gray-400">
                                Click to view invoices
                            </div>
                        </div>
                    ))}
                    {monthsData.length === 0 && (
                        <div className="col-span-3 text-center py-10 text-gray-400">
                            No history available.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 2. DETAILS VIEW (Invoices)
    if (view === 'details' && selectedMonth) {
        return (
            <div>
                <Header title={`${selectedMonth.fullLabel} - Invoices`} onBack={handleBack} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <SummaryBox label="Total Sales" value={`Rs ${selectedMonth.sales.toLocaleString()}`} icon={<DollarSign size={20} />} color="blue" />
                    <SummaryBox label="Net Profit" value={`Rs ${selectedMonth.profit.toLocaleString()}`} icon={<TrendingUp size={20} />} color="green" />
                    <SummaryBox label="Best Seller" value={selectedMonth.topItem} sub={`Qty: ${selectedMonth.topItemQty}`} icon={<Package size={20} />} color="orange" />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Inv #</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-right">Profit</th>
                                <th className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedMonth.invoices.map(inv => {
                                let invProfit = 0;
                                const productMap = new Map(products.map(p => [p.id, p]));
                                inv.items.forEach(item => {
                                    const qty = item.totalKg || item.qty || 0;
                                    const sell = item.pricePerKg || item.price || 0;
                                    let buy = item.buy;
                                    if (buy === undefined || buy === null) {
                                        const p = productMap.get(item.id);
                                        if (p) buy = p.buy;
                                    }
                                    invProfit += (sell - (buy || 0)) * qty;
                                });

                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">#{inv.id}</td>
                                        <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{inv.customer.name}</td>
                                        <td className="px-6 py-4 text-right font-bold">Rs {inv.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-green-600 font-bold">Rs {invProfit.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => printInvoice(inv)} className="text-blue-600 hover:underline text-xs">View/Print</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return <div className="p-10 text-center">Loading...</div>;
}

function Header({ title, onBack }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
    )
}

function SummaryBox({ label, value, sub, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600'
    };
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-full ${colors[color]}`}>{icon}</div>
            <div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-xl font-bold text-gray-800">{value}</div>
                {sub && <div className="text-xs text-gray-400">{sub}</div>}
            </div>
        </div>
    )
}

