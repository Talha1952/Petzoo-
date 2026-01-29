import React from 'react';
import { Modal } from './Modal';
import { CheckCircle, Printer, Plus } from 'lucide-react';

export function SuccessModal({ isOpen, onClose, invoice, onPrint, onNewSale }) {
    if (!invoice) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sale Completed!">
            <div className="flex flex-col items-center justify-center p-4">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                    <CheckCircle className="text-green-600 w-12 h-12" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-1">Invoice #{invoice.id}</h2>
                <p className="text-gray-500 mb-6">Total: Rs {invoice.total.toLocaleString()}</p>

                <div className="flex gap-4 w-full">
                    <button
                        onClick={() => onPrint(invoice)}
                        className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-900 shadow-lg"
                    >
                        <Printer size={20} /> Print Bill
                    </button>
                    <button
                        onClick={onNewSale}
                        className="flex-1 bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-dark shadow-lg"
                    >
                        <Plus size={20} /> New Sale
                    </button>
                </div>
            </div>
        </Modal>
    );
}
