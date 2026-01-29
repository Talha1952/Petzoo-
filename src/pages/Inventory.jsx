import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/Modal';
import { Plus, Edit2, Trash2, Search, RefreshCw, FolderPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Inventory() {
    const { products, addProduct, updateProduct, deleteProduct, loadDefaultList } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchParams] = useSearchParams();
    const filterType = searchParams.get('filter'); // Correct way for HashRouter

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', category: 'Loose Items', buy: '', sell: '', stock: '', unitLabel: 'Kg', lowStockThreshold: '' });
    const [isNewCat, setIsNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [isNewUnit, setIsNewUnit] = useState(false); // New Unit Custom Toggle
    const [customUnit, setCustomUnit] = useState('');

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category || 'Uncategorized'));
        return ['All', ...Array.from(cats).sort()];
    }, [products]);

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'low') {
            // Low Stock Logic
            let threshold = 5;
            if (p.unitLabel === 'Kg' || p.category === 'Loose Items') threshold = 10;
            if (p.unitLabel === 'Bag') threshold = 3;
            if (p.lowStockThreshold) threshold = p.lowStockThreshold;

            return p.stock <= threshold && matchesSearch; // Ignore category tabs if filter is low? Or keep them? Let's keep them useful.
        }

        return matchesCategory && matchesSearch;
    });

    // Grouping for "All" view
    const groupedProducts = useMemo(() => {
        if (activeCategory !== 'All') return { [activeCategory]: filteredProducts };

        const groups = {};
        filteredProducts.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [filteredProducts, activeCategory]);

    const handleSubmit = (e) => {
        console.log('Form Data Submitted:', formData);  
        e.preventDefault();
        const productData = {
            name: formData.name,
            category: isNewCat ? newCatName : formData.category,
            buy: Number(formData.buy),
            sell: Number(formData.sell),
            stock: Number(formData.stock),
            unit_label: isNewUnit ? customUnit : formData.unitLabel,
            low_Stock_Threshold: formData.lowStockThreshold ? Number(formData.lowStockThreshold) : null
        };

        if (editingProduct) {
            updateProduct(editingProduct.id, productData); // Keep ID
        } else {
            addProduct(productData);
        }
        closeModal();
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
            setIsNewCat(false);
            setIsNewUnit(false); // Default to dropdown unless custom approach needed later, but keeping simple
        } else {
            setEditingProduct(null);
            setFormData({ name: '', category: categories[1] || 'Loose Items', buy: '', sell: '', stock: '', unitLabel: 'Kg' });
            setIsNewCat(false);
            setIsNewUnit(false);
            setCustomUnit('');
            setNewCatName('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    if (user.role !== 'admin') {
        return <div className="p-10 text-center text-red-500 font-bold">Access Restricted: Inventory is managed by Shop Owner only.</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
                    <p className="text-sm text-gray-500">{products.length} Items Total</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadDefaultList} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors">
                        <RefreshCw size={16} /> Reset List (Import Pics)
                    </button>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-all font-bold">
                        <Plus size={18} /> Add New Item
                    </button>
                </div>
            </div>

            {/* Filters & Tabs */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary bg-gray-50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                    activeCategory === cat
                                        ? "bg-primary text-white shadow-md transform scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Listing */}
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200">
                {filterType === 'low' && (
                    <div className="bg-red-50 p-4 mb-4 border-l-4 border-red-500 text-red-700 font-bold flex justify-between items-center">
                        <span>⚠️ Showing Low Stock Items Only</span>
                        <button onClick={() => setSearchTerm('') || window.history.back()} className="text-sm underline hover:text-red-900">Clear Filter</button>
                    </div>
                )}
                {Object.keys(groupedProducts).length === 0 && (
                    <div className="p-10 text-center text-gray-400">No items found.</div>
                )}

                {Object.entries(groupedProducts).map(([catName, items]) => (
                    <div key={catName} className="border-b last:border-0">
                        <div className="bg-gray-50 px-6 py-3 font-bold text-gray-700 flex items-center gap-2 sticky top-0 border-b z-10">
                            <span className="w-2 h-6 bg-primary rounded-full"></span>
                            {catName} <span className="text-xs font-normal text-gray-400 ml-1">({items.length})</span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-white border-b sticky top-[49px] z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Unit</th>
                                    <th className="px-6 py-3 text-right">Cost</th>
                                    <th className="px-6 py-3 text-right text-primary font-bold">Retail</th>
                                    <th className="px-6 py-3 text-right">Stock</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-3 text-gray-500">{p.unitLabel || 'Kg'}</td>
                                        <td className="px-6 py-3 text-right text-gray-600">Rs {p.buy}</td>
                                        <td className="px-6 py-3 text-right font-bold text-primary">Rs {p.sell}</td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={cn(
                                                "px-2 py-1 rounded text-xs font-bold",
                                                (() => {
                                                    let threshold = 5;
                                                    if (p.unitLabel === 'Kg' || p.category === 'Loose Items') threshold = 10;
                                                    else if (p.unitLabel === 'Bag') threshold = 3;
                                                    if (p.lowStockThreshold) threshold = p.lowStockThreshold;

                                                    return p.stock <= threshold ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700";
                                                })()
                                            )}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                                <button onClick={() => deleteProduct(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* ADD/EDIT MODAL */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? "Edit Item" : "Add New Item"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        {!isNewCat ? (
                            <div className="flex gap-2">
                                <select className="flex-1 border p-2 rounded bg-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button type="button" onClick={() => setIsNewCat(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600" title="Create New Category">
                                    <FolderPlus size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input type="text" required autoFocus placeholder="Enter New Category Name" className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary outline-none" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                                <button type="button" onClick={() => setIsNewCat(false)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded font-bold">Cancel</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (Buy)</label>
                            <input type="number" required className="w-full border p-2 rounded" value={formData.buy} onChange={e => setFormData({ ...formData, buy: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price (Sell)</label>
                            <input type="number" required className="w-full border p-2 rounded" value={formData.sell} onChange={e => setFormData({ ...formData, sell: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                            <input type="number" required className="w-full border p-2 rounded font-bold" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Label</label>
                            {!isNewUnit ? (
                                <div className="flex gap-2">
                                    <select className="flex-1 border p-2 rounded bg-white" value={formData.unitLabel} onChange={e => setFormData({ ...formData, unitLabel: e.target.value })}>
                                        <option value="Kg">Kg</option>
                                        <option value="gm">gm</option>
                                        <option value="Pc">Pc (Piece)</option>
                                        <option value="Bag">Bag</option>
                                        <option value="Litre">Litre</option>
                                        <option value="Pack">Pack</option>
                                        <option value="Pouch">Pouch</option>
                                        <option value="Bottle">Bottle</option>
                                        <option value="Box">Box</option>
                                    </select>
                                    <button type="button" onClick={() => setIsNewUnit(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-600" title="Custom Unit">
                                        <FolderPlus size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        placeholder="e.g. Bottle, Box, Dozen"
                                        className="flex-1 border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                                        value={customUnit}
                                        onChange={e => setCustomUnit(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setIsNewUnit(false)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded font-bold">Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={closeModal} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-md">
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
