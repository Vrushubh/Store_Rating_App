import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Store, Users, Star, BarChart3, MapPin, Mail } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, isStoreOwner, isNormalUser } = useAuth();

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin"
            className="bg-primary-50 border border-primary-200 rounded-lg p-6 hover:bg-primary-100 transition-colors"
          >
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-primary-900">Statistics</h3>
                <p className="text-primary-600">View system overview</p>
              </div>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">Manage Users</h3>
                <p className="text-blue-600">Add, edit, and delete users</p>
              </div>
            </div>
          </Link>
          <Link
            to="/admin/stores"
            className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center">
              <Store className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-900">Manage Stores</h3>
                <p className="text-green-600">Add, edit, and delete stores</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const StoreOwnerDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Store Owner Dashboard</h2>
        <Link
          to="/store-owner"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Store className="h-4 w-4 mr-2" />
          View My Store
        </Link>
      </div>
    </div>
  );

  const NormalUserDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600 mb-6">
          Rate and review stores to help others make informed decisions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/stores"
            className="bg-primary-50 border border-primary-200 rounded-lg p-6 hover:bg-primary-100 transition-colors"
          >
            <div className="flex items-center">
              <Store className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-primary-900">Browse Stores</h3>
                <p className="text-primary-600">Find stores to rate and review</p>
              </div>
            </div>
          </Link>
          <Link
            to="/profile"
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900">My Profile</h3>
                <p className="text-blue-600">Update your information</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  const UserInfoCard = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
          <p className="text-gray-600">{user?.email}</p>
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {user?.role === 'admin' && 'System Administrator'}
              {user?.role === 'store_owner' && 'Store Owner'}
              {user?.role === 'user' && 'Normal User'}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{user?.address}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Store Rating dashboard</p>
      </div>

      <UserInfoCard />

      {isAdmin() && <AdminDashboard />}
      {isStoreOwner() && <StoreOwnerDashboard />}
      {isNormalUser() && <NormalUserDashboard />}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/stores"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Store className="h-4 w-4 mr-2" />
            Browse Stores
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Users className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
          {isAdmin() && (
            <>
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
              <Link
                to="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </>
          )}
          {isStoreOwner() && (
            <Link
              to="/store-owner"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Store className="h-4 w-4 mr-2" />
              My Store
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
