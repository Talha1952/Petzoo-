import React, { useState } from 'react';
import { Modal } from './Modal';
import { cn } from '../lib/utils';

export function UnitSelectionModal({ isOpen, onClose, product, onSelect }) {
    const [customQty, setCustomQty] = useState('');

    if (!product) return null;

    const isLoose = product.unitLabel === 'Kg';

    const LOOSE_UNITS = [
        { label: '1 Qtr (250g)', qty: 0.25 },
        { label: '2 Qtr (Half Kg)', qty: 0.5 },
        { label: '3 Qtr (750g)', qty: 0.75 },
        { label: '1 Kg', qty: 1 },
        { label: '2 Kg', qty: 2 },
        { label: '5 Kg', qty: 5 },
        { label: '10 Kg', qty: 10 },
        { label: '20 Kg', qty: 20 }, // Half Maan
        { label: '40 Kg (Maan)', qty: 40 },
    ];

    const PACK_UNITS = [1, 2, 3, 4, 5, 6, 10, 12, 24, 50];

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const qty = parseFloat(customQty);
        if (qty > 0) {
            onSelect(product, { label: `${qty} ${product.unitLabel}`, kg: qty });
            setCustomQty('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Select Quantity for ${product.name}`}>
            <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded">
                <div>
                    <span className="text-gray-500 text-sm">Retail Price:</span>
                    <div className="font-bold text-lg text-primary">Rs {product.sell} / {product.unitLabel}</div>
                </div>
                <div className="text-right">
                    <span className="text-gray-500 text-sm">Current Stock:</span>
                    <div className={cn("font-bold text-lg", product.stock <= 10 ? "text-red-500" : "text-gray-800")}>
                        {product.stock} {product.unitLabel}
                    </div>
                </div>
            </div>

            {isLoose ? (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {LOOSE_UNITS.map((unit) => (
                        <button
                            key={unit.label}
                            onClick={() => onSelect(product, { label: unit.label, kg: unit.qty })}
                            className="p-3 rounded-lg border bg-white border-gray-200 hover:border-primary hover:bg-blue-50 hover:text-primary transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                        >
                            <span className="font-bold text-sm">{unit.label}</span>
                            <span className="text-xs text-gray-500">Rs {(product.sell * unit.qty).toLocaleString()}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-3 mb-4">
                    {PACK_UNITS.map((qty) => (
                        <button
                            key={qty}
                            onClick={() => onSelect(product, { label: `${qty} ${product.unitLabel}`, kg: qty })}
                            className="p-3 rounded-lg border bg-white border-gray-200 hover:border-accent hover:bg-orange-50 hover:text-accent transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                        >
                            <span className="font-bold text-lg">{qty}</span>
                            <span className="text-[10px] text-gray-400 uppercase">{product.unitLabel}</span>
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Quantity</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Enter Qty..."
                        className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                        value={customQty}
                        onChange={e => setCustomQty(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-gray-900">
                        Add
                    </button>
                </div>
            </form>
        </Modal>
    );
}
