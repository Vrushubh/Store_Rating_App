import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Stores from './components/stores/Stores';
import StoreDetail from './components/stores/StoreDetail';
import Profile from './components/profile/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminStores from './components/admin/AdminStores';
import StoreOwnerDashboard from './components/store-owner/StoreOwnerDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register />} 
          />

          {/* Protected routes */}
          <Route 
            path="/" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/stores" 
            element={user ? <Stores /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/stores/:id" 
            element={user ? <StoreDetail /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile /> : <Navigate to="/login" />} 
          />

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/users" 
            element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/stores" 
            element={user?.role === 'admin' ? <AdminStores /> : <Navigate to="/" />} 
          />

          {/* Store owner routes */}
          <Route 
            path="/store-owner" 
            element={user?.role === 'store_owner' ? <StoreOwnerDashboard /> : <Navigate to="/" />} 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
