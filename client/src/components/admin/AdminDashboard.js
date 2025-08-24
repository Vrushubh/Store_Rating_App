import React, { useState, useEffect } from 'react';
import { Users, Store, Star, TrendingUp, UserPlus, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, action, color }) => (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={action}>
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's an overview of your system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-blue-600"
          description="Registered users in the system"
        />
        
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          color="text-green-600"
          description="Stores in the system"
        />
        
        <StatCard
          title="Total Ratings"
          value={stats.totalRatings}
          icon={Star}
          color="text-yellow-600"
          description="Ratings submitted by users"
        />
        
        <StatCard
          title="Average Rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          icon={TrendingUp}
          color="text-purple-600"
          description="Overall system rating"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            title="Add New User"
            description="Create a new user account"
            icon={UserPlus}
            color="text-blue-600"
            action={() => window.location.href = '/admin/users'}
          />
          
          <QuickActionCard
            title="Add New Store"
            description="Register a new store in the system"
            icon={Building2}
            color="text-green-600"
            action={() => window.location.href = '/admin/stores'}
          />
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {stats.recentUsers?.slice(0, 5).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'store_owner' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {(!stats.recentUsers || stats.recentUsers.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Stores */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Stores</h3>
            <div className="space-y-3">
              {stats.recentStores?.slice(0, 5).map(store => (
                <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{store.name}</p>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {store.totalRatings || 0} rating{store.totalRatings !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats.recentStores || stats.recentStores.length === 0) && (
                <p className="text-gray-500 text-center py-4">No recent stores</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Manage your system:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="btn btn-primary"
          >
            Manage Users
          </button>
          <button
            onClick={() => window.location.href = '/admin/stores'}
            className="btn btn-secondary"
          >
            Manage Stores
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
