import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Modal({ isOpen, onClose, title, children, className }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={cn("bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200", className)}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
