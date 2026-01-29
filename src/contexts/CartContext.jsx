import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { useData } from './DataContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { products } = useData();

    const addToCart = (product, unit) => {
        const totalKg = unit.kg;

        // Stock Check
        if (product.stock < totalKg) {
            toast.error(`Not enough stock! Available: ${product.stock} Kg`);
            return;
        }

        const cartKey = `${product.id}-${unit.label}`;
        const existingIndex = cart.findIndex(item => item.cartKey === cartKey);

        if (existingIndex > -1) {
            // Update existing
            const existingItem = cart[existingIndex];
            const newTotalKg = existingItem.totalKg + totalKg;

            if (product.stock < newTotalKg) {
                toast.error(`Not enough stock to add more! Available: ${product.stock} Kg`);
                return;
            }

            const updatedCart = [...cart];
            updatedCart[existingIndex] = {
                ...existingItem,
                qty: existingItem.qty + 1,
                totalKg: newTotalKg
            };
            setCart(updatedCart);
        } else {
            // Add new
            const newItem = {
                cartKey: cartKey,
                id: product.id,
                name: product.name,
                unitLabel: unit.label,
                kgPerUnit: unit.kg,
                pricePerKg: product.sell,
                buyPerKg: product.buy,
                qty: 1,
                totalKg: totalKg
            };
            setCart([...cart, newItem]);
        }
        toast.success("Added to cart");
    };

    const updateQty = (index, change) => {
        const item = cart[index];
        const product = products.find(p => p.id === item.id);

        if (!product) {
            toast.error("Product not found");
            return;
        }

        const changeKg = item.kgPerUnit * change;
        const newTotalKg = item.totalKg + changeKg;

        if (change > 0 && (product.stock < newTotalKg)) {
            toast.error(`Not enough stock! Max available: ${product.stock}kg`);
            return;
        }

        if (item.qty + change <= 0) {
            // Remove item
            const newCart = cart.filter((_, i) => i !== index);
            setCart(newCart);
        } else {
            // Update item
            const newCart = [...cart];
            newCart[index] = {
                ...item,
                qty: item.qty + change,
                totalKg: newTotalKg
            };
            setCart(newCart);
        }
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.pricePerKg * item.totalKg), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQty, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
