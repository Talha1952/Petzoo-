import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Udhar from './pages/Udhar';
import POS from './pages/POS';
import Reports from './pages/Reports';
import Users from './pages/Users';

// Placeholder Pages for now
const PlaceHolder = ({ title }) => <div className="p-10 font-bold text-2xl text-gray-400">{title} (Coming Soon)</div>;

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/udhar" element={<Udhar />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/reports/profit" element={<Reports />} />
        <Route path="/users" element={<Users />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
