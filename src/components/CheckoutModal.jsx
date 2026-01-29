import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function CheckoutModal({ isOpen, onClose, total, onConfirm }) {
    const { user } = useAuth();
    const [method, setMethod] = useState('cash'); // cash, partial, credit

    // Form for Credit/Partial
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [cashReceived, setCashReceived] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset
            setMethod('cash');
            setCustomerName('');
            setPhone('');
            setDueDate('');
            setCashReceived('');
        }
    }, [isOpen]);

    const remainingUdhar = method === 'partial'
        ? Math.max(0, total - (parseFloat(cashReceived) || 0))
        : (method === 'credit' ? total : 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for Credit Cases
        if (method !== 'cash') {
            if (!customerName.trim() || !phone.trim()) {
                return toast.error("Customer Name & Phone are required for Udhar!");
            }
        }

        const paid = method === 'cash' ? total : (parseFloat(cashReceived) || 0);
        const remaining = total - paid;

        onConfirm({
            paymentType: method,
            subtotal: total, // For now subtotal = total (no tax)
            total: total,
            paid: paid,
            remaining: remaining,
            customer: {
                name: customerName,
                phone: phone
            },
            dueDate: dueDate,
            userName: user.name
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Checkout Invoice">
            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center mb-6">
                <span className="text-gray-600 font-medium">Total Payable:</span>
                <span className="text-2xl font-bold text-primary">Rs {total.toLocaleString()}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-gray-200 has-[:checked]:border-primary has-[:checked]:bg-green-50">
                        <input type="radio" name="payMethod" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-bold block text-gray-800">✅ Type 1: Full Cash Payment</span>
                            <span className="text-xs text-gray-500">Bill clears immediately. No credit.</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-gray-200 has-[:checked]:border-accent has-[:checked]:bg-orange-50">
                        <input type="radio" name="payMethod" value="credit" checked={method === 'credit'} onChange={() => setMethod('credit')} className="w-5 h-5 text-accent" />
                        <div>
                            <span className="font-bold block text-gray-800">📋 Type 2: Full Udhar (Credit)</span>
                            <span className="text-xs text-gray-500">Full amount goes to pending balance.</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 border-gray-200 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                        <input type="radio" name="payMethod" value="partial" checked={method === 'partial'} onChange={() => setMethod('partial')} className="w-5 h-5 text-purple-600" />
                        <div>
                            <span className="font-bold block text-gray-800">⚖️ Type 3: Partial Payment</span>
                            <span className="text-xs text-gray-500">Adha Cash, Adha Udhar.</span>
                        </div>
                    </label>
                </div>

                {(method === 'partial' || method === 'credit') && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 animate-in fade-in">
                        <h4 className="font-bold text-sm text-gray-700 uppercase mb-2">Customer Details (Mandatory)</h4>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <input type="text" required className="w-full border p-2 rounded" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Ali Bhai" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" required className="w-full border p-2 rounded" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0300-1234567" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Return Date (Due Date)</label>
                            <input type="date" required className="w-full border p-2 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>

                        {method === 'partial' && (
                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cash Received Now (Rs)</label>
                                <input
                                    type="number" step="0.01" required
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none font-bold text-lg"
                                    value={cashReceived}
                                    onChange={e => setCashReceived(e.target.value)}
                                    placeholder="0"
                                    max={total}
                                />
                                <div className="flex justify-between mt-2 text-sm">
                                    <span className="text-green-600 font-bold">Paid: Rs {parseFloat(cashReceived || 0).toLocaleString()}</span>
                                    <span className="text-red-600 font-bold">Remaining: Rs {remainingUdhar.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-md flex-1">
                        CONFIRM INVOICE
                    </button>
                </div>
            </form>
        </Modal>
    );
}
