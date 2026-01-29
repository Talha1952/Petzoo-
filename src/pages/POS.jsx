import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useCart } from '../contexts/CartContext';
import { UnitSelectionModal } from '../components/UnitSelectionModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { SuccessModal } from '../components/SuccessModal';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { printInvoice } from '../lib/printUtils';
import toast from 'react-hot-toast';

export default function POS() {
    const navigate = useNavigate();
    const { products, addInvoice } = useData();
    const { cart, addToCart, updateQty, clearCart, cartTotal } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // Modal States
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastInvoice, setLastInvoice] = useState(null); // For success modal

    // Get Categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Uncategorized'));
        return ['All', ...Array.from(cats).sort()];
    }, [products]);

    // Filter Products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleProductClick = (product) => {
        if (product.stock <= 0) return toast.error("Out of Stock");
        setSelectedProduct(product);
    };

    const handleUnitSelect = (product, unit) => {
        addToCart(product, unit);
        setSelectedProduct(null); // Close modal
    };

    const handleCheckout = async (checkoutData) => {
        const invoice = {
            ...checkoutData,
            items: [...cart]
        };

        const result = await addInvoice(invoice);
        if (result) {
            setLastInvoice(result); // Show success modal
            setIsCheckoutOpen(false);
            // We clear cart in handlePrint or handleNewSale to ensure user sees the success state first
        }
    };

    const handlePrint = (invoice) => {
        printInvoice(invoice);
        clearCart();
        setLastInvoice(null);
    };

    const handleNewSale = () => {
        clearCart();
        setLastInvoice(null);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-4">

            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Search & Categories Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3 sticky top-0 z-10">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoFocus
                    />

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                    activeCategory === cat
                                        ? "bg-primary text-white border-primary shadow-md transform scale-105"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 content-start grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredProducts.map(p => {
                        const isStockOut = p.stock <= 0;
                        return (
                            <div
                                key={p.id}
                                onClick={() => !isStockOut && handleProductClick(p)}
                                className={cn(
                                    "flex flex-col justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md h-[120px] relative overflow-hidden group",
                                    isStockOut ? "opacity-60 bg-gray-50 cursor-not-allowed grayscale" : "bg-white hover:border-primary border-gray-100"
                                )}
                            >
                                <div className="font-semibold text-sm line-clamp-2 leading-tight z-10 relative">{p.name}</div>
                                <div className="z-10 relative">
                                    <div className="text-primary font-bold">Rs {p.sell}</div>
                                    <div className={cn("text-xs mt-1 font-medium", isStockOut ? "text-red-500" : "text-green-600")}>
                                        {isStockOut ? 'Out of Stock' : `${p.stock.toLocaleString()} ${p.unitLabel || 'Kg'} avail`}
                                    </div>
                                </div>
                                {/* Category Badge Background */}
                                <div className="absolute -bottom-4 -right-2 text-[50px] opacity-5 pointer-events-none rotate-[-15deg]">
                                    {p.category?.[0]}
                                </div>
                            </div>
                        );
                    })}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full h-40 flex items-center justify-center text-gray-400">
                            No products found in this category.
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart Panel */}
            <div className="w-96 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-800 text-white font-bold flex items-center gap-2 shadow-sm">
                    <ShoppingCart size={20} /> Current Bill
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <ShoppingCart size={48} className="mb-2 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={item.cartKey} className="flex justify-between items-center border-b pb-2 last:border-0 animation-fade-in">
                                <div>
                                    <div className="font-medium text-sm">{item.name}</div>
                                    <div className="text-xs text-gray-500">{item.unitLabel} ({item.totalKg})</div>
                                    <div className="text-xs font-bold text-primary">Rs {(item.pricePerKg * item.totalKg).toLocaleString()}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQty(index, -1)} className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100 text-gray-600">
                                        <Minus size={12} />
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(index, 1)} className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-gray-100 text-gray-600">
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-medium">Total</span>
                        <span className="text-2xl font-bold text-gray-900">Rs {cartTotal.toLocaleString()}</span>
                    </div>

                    <button
                        disabled={cart.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        PROCEED TO CHECKOUT
                    </button>
                </div>
            </div>

            {/* MODALS */}
            <UnitSelectionModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                onSelect={handleUnitSelect}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                total={cartTotal}
                onConfirm={handleCheckout}
            />

            <SuccessModal
                isOpen={!!lastInvoice}
                onClose={() => setLastInvoice(null)}
                invoice={lastInvoice}
                onPrint={handlePrint}
                onNewSale={handleNewSale}
            />
        </div>
    );
}
