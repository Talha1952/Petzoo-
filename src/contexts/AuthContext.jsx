import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSession();
        loadUsers();
    }, []);

    const loadSession = () => {
        const storedSession = sessionStorage.getItem('petzo_user');
        if (storedSession) setUser(JSON.parse(storedSession));
    };

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*');

            if (error) throw error;

            // Map database names to app names
            const formattedUsers = (data || []).map(u => ({
                id: u.id,
                user: u.username,
                pass: u.password,
                name: u.name,
                role: u.role
            }));

            setUsersList(formattedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error || !data) {
                toast.error("Invalid credentials");
                return false;
            }

            const userSession = {
                id: data.id,
                user: data.username,
                name: data.name,
                role: data.role
            };

            setUser(userSession);
            sessionStorage.setItem('petzo_user', JSON.stringify(userSession));
            toast.success(`Welcome back, ${data.name}!`);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Login failed");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('petzo_user');
        toast.success("Logged out");
    };

    const addUser = async (username, password, name, role = 'staff') => {
        try {
            const { error } = await supabase
                .from('users')
                .insert([{ username, password, name, role }]);

            if (error) throw error;

            await loadUsers(); // Refresh the list
            toast.success("New staff member added!");
            return true;
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error('Failed to add user');
            return false;
        }
    };

    const updateUser = async (id, newUsername, newPassword, newName) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    username: newUsername,
                    password: newPassword,
                    name: newName
                })
                .eq('id', id);

            if (error) throw error;

            await loadUsers(); // Reload users list
            toast.success("User updated successfully!");
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, usersList, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
