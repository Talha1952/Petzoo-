import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load & Real-time Subscriptions
    useEffect(() => {
        loadData();

        // Real-time listener for Invoices
        const invoiceChannel = supabase
            .channel('public:invoices')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload) => {
                console.log('Invoice change received!', payload);
                if (payload.eventType === 'INSERT') {
                    const inv = payload.new;
                    const formatted = {
                        ...inv,
                        customer: { name: inv.customer_name, phone: inv.customer_phone },
                        paymentType: inv.payment_type,
                        userName: inv.user_name,
                        dueDate: inv.due_date
                    };
                    setInvoices(prev => [formatted, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    const inv = payload.new;
                    setInvoices(prev => prev.map(i => i.id === inv.id ? {
                        ...inv,
                        customer: { name: inv.customer_name, phone: inv.customer_phone },
                        paymentType: inv.payment_type,
                        userName: inv.user_name,
                        dueDate: inv.due_date
                    } : i));
                } else if (payload.eventType === 'DELETE') {
                    setInvoices(prev => prev.filter(i => i.id !== payload.old.id));
                }
            })
            .subscribe();

        // Real-time listener for Products
        const productChannel = supabase
            .channel('public:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
                console.log('Product change received!', payload);
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    const p = payload.new;
                    const formatted = {
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        buy: p.buy,
                        sell: p.sell,
                        stock: p.stock,
                        unitLabel: p.unit_label,
                        lowStockThreshold: p.low_stock_threshold
                    };
                    setProducts(prev => {
                        const exists = prev.find(item => item.id === p.id);
                        if (exists) return prev.map(item => item.id === p.id ? formatted : item);
                        return [...prev, formatted];
                    });
                } else if (payload.eventType === 'DELETE') {
                    setProducts(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(invoiceChannel);
            supabase.removeChannel(productChannel);
        };
    }, []);

    const loadData = async () => {
        try {
            // Load Products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (productsError) throw productsError;

            // Load Invoices
            const { data: invoicesData, error: invoicesError } = await supabase
                .from('invoices')
                .select('*')
                .order('id', { ascending: false });

            if (invoicesError) throw invoicesError;

            // Convert products to app format
            const formattedProducts = (productsData || []).map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                buy: p.buy,
                sell: p.sell,
                stock: p.stock,
                unitLabel: p.unit_label,
                lowStockThreshold: p.low_stock_threshold
            }));

            // Convert invoices to app format
            const formattedInvoices = (invoicesData || []).map(inv => ({
                ...inv,
                customer: {
                    name: inv.customer_name,
                    phone: inv.customer_phone
                },
                paymentType: inv.payment_type,
                userName: inv.user_name,
                dueDate: inv.due_date
            }));

            setProducts(formattedProducts);
            setInvoices(formattedInvoices);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data from database');
        } finally {
            setLoading(false);
        }
    };

    // --- PRODUCT ACTIONS ---
    const addProduct = async (product) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([product])
                .select()
                .single();

            if (error) throw error;

            setProducts([...products, data]);
            toast.success("Product added!");
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('Failed to add product');
        }
    };

    const updateProduct = async (id, updatedFields) => {
        console.log('Updating product ID:', id, 'with fields:', updatedFields);
        try {
            const { error } = await supabase
                .from('products')
                .update(updatedFields)
                .eq('id', id);

            if (error) throw error;

            setProducts(products.map(p => p.id === id ? { ...p, ...updatedFields } : p));
            toast.success("Product updated!");
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Delete this product?")) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(products.filter(p => p.id !== id));
            toast.success("Product deleted!");
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const loadDefaultList = async () => {
        if (!window.confirm("Load default product list? This will ADD to existing products.")) return;

        try {
            // Supabase will auto-generate id, so we don't need to include it
            const productsToInsert = INITIAL_PRODUCTS.map(p => ({
                name: p.name,
                category: p.category,
                buy: p.buy,
                sell: p.sell,
                stock: p.stock,
                unit_label: p.unitLabel, // Convert camelCase to snake_case
                low_stock_threshold: p.lowStockThreshold || null
            }));

            const { data, error } = await supabase
                .from('products')
                .insert(productsToInsert)
                .select();

            if (error) throw error;

            // Convert back to app format
            const formattedProducts = data.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                buy: p.buy,
                sell: p.sell,
                stock: p.stock,
                unitLabel: p.unit_label,
                lowStockThreshold: p.low_stock_threshold
            }));

            setProducts([...products, ...formattedProducts]);
            toast.success(`${data.length} default products loaded!`);
        } catch (error) {
            console.error('Error loading defaults:', error);
            toast.error(`Failed to load default products: ${error.message}`);
        }
    };

    // --- INVOICE ACTIONS ---
    const addInvoice = async (invoice) => {
        try {
            // Prepare invoice data for database with safe defaults
            const invoiceData = {
                date: invoice.date || new Date().toISOString(),
                customer_name: invoice.customer?.name || 'Walk-in Customer',
                customer_phone: invoice.customer?.phone || null,
                items: invoice.items || [],
                subtotal: invoice.subtotal || 0,
                total: invoice.total || 0,
                paid: invoice.paid || 0,
                remaining: invoice.remaining || 0,
                payment_type: invoice.paymentType || 'cash',
                status: invoice.status || (invoice.remaining > 0 ? 'Pending' : 'Paid'),
                history: invoice.history || [],
                user_name: invoice.userName || 'Unknown',
                due_date: invoice.dueDate || null
            };

            const { data, error } = await supabase
                .from('invoices')
                .insert([invoiceData])
                .select()
                .single();

            if (error) throw error;

            // Update local stock
            const updatedProducts = [...products];
            invoice.items.forEach(item => {
                const product = updatedProducts.find(p => p.id === item.id);
                if (product) {
                    product.stock -= item.totalKg;
                    // Update in database
                    supabase
                        .from('products')
                        .update({ stock: product.stock })
                        .eq('id', product.id)
                        .then(({ error }) => {
                            if (error) console.error('Stock update error:', error);
                        });
                }
            });
            setProducts(updatedProducts);

            // Convert database format back to app format
            const formattedInvoice = {
                ...data,
                id: data.id,
                customer: {
                    name: data.customer_name,
                    phone: data.customer_phone
                },
                paymentType: data.payment_type,
                userName: data.user_name,
                dueDate: data.due_date
            };

            setInvoices([formattedInvoice, ...invoices]);
            toast.success("Invoice saved!");
            return formattedInvoice;
        } catch (error) {
            console.error('Error adding invoice:', error);
            console.error('Invoice data attempted:', invoice);
            console.error('Error details:', error.message, error.details, error.hint);
            toast.error(`Failed to save invoice: ${error.message || 'Unknown error'}`);
            return null;
        }
    };

    const updateInvoicePayment = async (id, paymentAmount) => {
        try {
            const invoice = invoices.find(inv => inv.id === id);
            if (!invoice) return;

            const newPaid = invoice.paid + paymentAmount;
            const newRemaining = invoice.total - newPaid;
            const newHistory = [...(invoice.history || []), {
                date: new Date().toISOString(),
                amount: paymentAmount
            }];

            const updateData = {
                paid: newPaid,
                remaining: newRemaining,
                history: newHistory,
                status: newRemaining <= 0 ? 'Paid' : 'Pending'
            };

            const { error } = await supabase
                .from('invoices')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            setInvoices(invoices.map(inv =>
                inv.id === id
                    ? { ...inv, ...updateData }
                    : inv
            ));

            toast.success(`Payment of Rs ${paymentAmount} recorded!`);
        } catch (error) {
            console.error('Error updating payment:', error);
            toast.error('Failed to update payment');
        }
    };

    const deleteInvoice = async (id) => {
        if (!window.confirm("Delete this invoice? Stock will be restored.")) return;

        try {
            const invoice = invoices.find(i => i.id === id);
            if (!invoice) return;

            // Restore stock
            const updatedProducts = [...products];
            invoice.items.forEach(item => {
                const product = updatedProducts.find(p => p.id === item.id);
                if (product) {
                    product.stock += item.totalKg;
                    // Update in database
                    supabase
                        .from('products')
                        .update({ stock: product.stock })
                        .eq('id', product.id)
                        .then(({ error }) => {
                            if (error) console.error('Stock restore error:', error);
                        });
                }
            });
            setProducts(updatedProducts);

            // Delete invoice
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setInvoices(invoices.filter(i => i.id !== id));
            toast.error("Invoice deleted & Stock restored.");
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
        }
    };

    // DEBUG: Generate Demo Data (keep for testing)
    const loadDemoData = async () => {
        if (!window.confirm("Load Demo Data? This will add fake invoices for 2025/2026.")) return;

        const demoInvoices = [];
        const months = [-1, -2, -3, -13, -14];

        months.forEach((offset, index) => {
            const d = new Date();
            d.setMonth(d.getMonth() + offset);
            const year = d.getFullYear();
            const month = d.getMonth();

            for (let i = 1; i <= 3; i++) {
                const invDate = new Date(year, month, i * 5, 10 + i, 30);

                demoInvoices.push({
                    date: invDate.toISOString(),
                    customer_name: `Demo User ${5000 + (index * 10) + i}`,
                    customer_phone: '0300-0000000',
                    items: [
                        { id: 1, name: "Demo Product A", unitLabel: 'Kg', qty: 2, totalKg: 2, pricePerKg: 1000, buy: 800 },
                        { id: 2, name: "Demo Product B", unitLabel: 'Bag', qty: 1, totalKg: 1, pricePerKg: 5000, buy: 4500 }
                    ],
                    subtotal: 7000,
                    total: 7000,
                    paid: 7000,
                    remaining: 0,
                    payment_type: 'cash',
                    status: 'Paid',
                    history: [],
                    user_name: 'Admin'
                });
            }
        });

        try {
            const { data, error } = await supabase
                .from('invoices')
                .insert(demoInvoices)
                .select();

            if (error) throw error;

            // Convert to app format
            const formatted = data.map(inv => ({
                ...inv,
                customer: { name: inv.customer_name, phone: inv.customer_phone },
                paymentType: inv.payment_type,
                userName: inv.user_name,
                dueDate: inv.due_date
            }));

            setInvoices([...formatted, ...invoices]);
            toast.success("Demo Data Loaded! Check Reports.");
        } catch (error) {
            console.error('Error loading demo data:', error);
            toast.error('Failed to load demo data');
        }
    };

    return (
        <DataContext.Provider value={{
            products,
            invoices,
            loading,
            addProduct, updateProduct, deleteProduct, loadDefaultList,
            addInvoice, updateInvoicePayment, deleteInvoice, loadDemoData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
