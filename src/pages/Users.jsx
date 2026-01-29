import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Edit2, Check, X } from 'lucide-react';

export default function Users() {
    const { usersList, updateUser, addUser, user: currentUser } = useAuth();
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ user: '', pass: '', name: '' });

    // Add User State
    const [isAddMode, setIsAddMode] = useState(false);
    const [addForm, setAddForm] = useState({ user: '', pass: '', name: '', role: 'staff' });

    // Protect Route
    if (currentUser.role !== 'admin') {
        return <div className="p-10 text-center text-red-500">Access Denied</div>;
    }

    const startEdit = (u) => {
        setEditingId(u.id);
        setEditForm({ user: u.user, pass: u.pass, name: u.name });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = (id) => {
        updateUser(id, editForm.user, editForm.pass, editForm.name);
        setEditingId(null);
    };

    const handleAddUser = async () => {
        if (!addForm.user || !addForm.pass || !addForm.name) {
            alert("Please fill all fields");
            return;
        }
        const success = await addUser(addForm.user, addForm.pass, addForm.name, addForm.role);
        if (success) {
            setAddForm({ user: '', pass: '', name: '', role: 'staff' });
            setIsAddMode(false);
        }
    };

    return (
        <div className="pb-10">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-sm text-gray-500">Manage login credentials for your staff.</p>
                </div>
                {!isAddMode && (
                    <button
                        onClick={() => setIsAddMode(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-primary-dark transition-all"
                    >
                        + Add New Staff
                    </button>
                )}
            </div>

            {/* Quick Add Form */}
            {isAddMode && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6 animate-in slide-in-from-top duration-300">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <User size={18} /> Add New Staff Member
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Full Name</label>
                            <input
                                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g. Ali Ahmed"
                                value={addForm.name}
                                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Username</label>
                            <input
                                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g. ali123"
                                value={addForm.user}
                                onChange={e => setAddForm({ ...addForm, user: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                placeholder="••••••••"
                                value={addForm.pass}
                                onChange={e => setAddForm({ ...addForm, pass: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddUser}
                                className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary-dark transition-all"
                            >
                                SAVE
                            </button>
                            <button
                                onClick={() => setIsAddMode(false)}
                                className="bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Display Name</th>
                            <th className="px-6 py-3">Username</th>
                            <th className="px-6 py-3">Password</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usersList.map(u => {
                            const isEditing = editingId === u.id;
                            return (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input className="border p-1 rounded w-full outline-none focus:ring-1 focus:ring-primary" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        ) : (
                                            <div className="font-medium text-gray-900">{u.name}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input className="border p-1 rounded w-full outline-none focus:ring-1 focus:ring-primary" value={editForm.user} onChange={e => setEditForm({ ...editForm, user: e.target.value })} />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" /> {u.user}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input className="border p-1 rounded w-full outline-none focus:ring-1 focus:ring-primary" value={editForm.pass} onChange={e => setEditForm({ ...editForm, pass: e.target.value })} />
                                        ) : (
                                            <div className="flex items-center gap-2 font-mono text-gray-500">
                                                <Lock size={14} className="text-gray-400" /> {u.pass}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => saveEdit(u.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={18} /></button>
                                                <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
