import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/Modal';
import { DollarSign, Search, History, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Udhar() {
    const { invoices, updateInvoicePayment } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [payAmount, setPayAmount] = useState('');

    // Filter only Pending Invoices
    const pendingInvoices = useMemo(() => {
        let list = invoices.filter(inv => inv.remaining > 0);

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(inv =>
                inv.customer.name.toLowerCase().includes(lower) ||
                inv.customer.phone.includes(lower) ||
                inv.id.toString().includes(lower)
            );
        }
        return list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [invoices, searchTerm]);

    const openPayModal = (inv) => {
        setSelectedInvoice(inv);
        setPayAmount('');
        setIsPayModalOpen(true);
    };

    const openHistoryModal = (inv) => {
        setSelectedInvoice(inv);
        setIsHistoryModalOpen(true);
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        if (selectedInvoice && payAmount) {
            const amount = parseFloat(payAmount);
            if (amount > selectedInvoice.remaining) {
                alert("Amount cannot exceed remaining balance!");
                return;
            }
            updateInvoicePayment(selectedInvoice.id, amount, user.name);
            setIsPayModalOpen(false);
        }
    };

    const handleFullPayment = () => {
        if (selectedInvoice) setPayAmount(selectedInvoice.remaining);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Credit Management (Udhar)</h2>
                    <p className="text-sm text-gray-500">Track pending payments and collection history</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Customer..."
                            className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary w-full"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">Details</th>
                                <th className="px-4 py-3">Amounts</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingInvoices.length > 0 ? pendingInvoices.map(inv => {
                                const isOverdue = inv.dueDate && new Date() > new Date(inv.dueDate);
                                return (
                                    <tr key={inv.id} className={cn("hover:bg-gray-50 border-l-4", isOverdue ? "border-l-red-600 bg-red-50/50" : "border-l-orange-400")}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-bold text-gray-800 text-lg">{inv.customer.name}</div>
                                                    <div className="text-sm text-gray-600">{inv.customer.phone}</div>
                                                    <div className="text-xs text-gray-400 mt-1">Inv #{inv.id} • {new Date(inv.date).toLocaleDateString()}</div>
                                                    {isOverdue && <div className="text-xs text-red-600 font-bold mt-1 bg-red-100 inline-block px-2 rounded">DUE: {new Date(inv.dueDate).toLocaleDateString()}</div>}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Sold by: <span className="font-semibold text-gray-700">{inv.userName || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between w-40 text-xs">
                                                    <span>Total:</span> <span className="font-medium">Rs {inv.total.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between w-40 text-xs text-green-600">
                                                    <span>Paid:</span> <span className="font-medium">Rs {inv.paid.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between w-40 text-sm font-bold text-red-600 border-t pt-1 mt-1">
                                                    <span>Due:</span> <span>Rs {inv.remaining.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col gap-2 items-end">
                                                <button
                                                    onClick={() => openPayModal(inv)}
                                                    className="w-32 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-primary-dark inline-flex items-center justify-center gap-1 shadow-sm"
                                                >
                                                    <DollarSign size={14} /> Collect
                                                </button>
                                                <button
                                                    onClick={() => openHistoryModal(inv)}
                                                    className="w-32 px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-medium rounded hover:bg-gray-50 inline-flex items-center justify-center gap-1"
                                                >
                                                    <History size={14} /> History
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-12 text-center text-gray-500">No Pending Credits</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAY MODAL */}
            <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Receive Payment">
                <form onSubmit={handlePaySubmit} className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <h3 className="text-lg font-bold text-gray-900">{selectedInvoice?.customer.name}</h3>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-sm font-medium text-gray-600">Balance Due:</span>
                            <span className="text-xl font-bold text-red-600">Rs {selectedInvoice?.remaining.toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Receiving (Rs)</label>
                        <div className="flex gap-2">
                            <input
                                type="number" step="0.01" required
                                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary outline-none text-lg font-bold"
                                value={payAmount} onChange={e => setPayAmount(e.target.value)}
                                max={selectedInvoice?.remaining} placeholder="0" autoFocus
                            />
                            <button type="button" onClick={handleFullPayment} className="bg-gray-100 px-4 rounded font-bold hover:bg-gray-200">Full</button>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark">
                        Confirm Payment
                    </button>
                </form>
            </Modal>

            {/* HISTORY MODAL */}
            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Payment History">
                <div className="bg-gray-50 p-4 rounded mb-4">
                    <h3 className="font-bold">{selectedInvoice?.customer.name}</h3>
                    <div className="text-xs text-gray-500">Inv #{selectedInvoice?.id}</div>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedInvoice?.history?.map((h, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0 hover:bg-gray-50 p-2 rounded">
                            <div>
                                <div className="font-bold text-gray-800">Rs {h.amount.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">{new Date(h.date).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-primary uppercase">{h.type}</div>
                                <div className="text-xs text-gray-600">By: <span className="font-semibold text-gray-900">{h.recordedBy || 'Admin'}</span></div>
                            </div>
                        </div>
                    ))}
                    {(!selectedInvoice?.history || selectedInvoice.history.length === 0) && (
                        <div className="text-center text-gray-400 py-4">No history found</div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
