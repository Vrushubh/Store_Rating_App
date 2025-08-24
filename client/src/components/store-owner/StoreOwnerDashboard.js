import React, { useState, useEffect } from 'react';
import { Store, Star, Users, TrendingUp, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    recentRatings: []
  });

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      // Fetch store details
      const storeResponse = await axios.get('/api/users/store');
      setStore(storeResponse.data);
      
      // Fetch store ratings
      const ratingsResponse = await axios.get('/api/ratings/store/' + storeResponse.data.id + '/all');
      setRatings(ratingsResponse.data);
      
      // Calculate stats
      const totalRatings = ratingsResponse.data.length;
      const averageRating = totalRatings > 0 
        ? ratingsResponse.data.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        : 0;
      
      setStats({
        totalRatings,
        averageRating,
        recentRatings: ratingsResponse.data.slice(0, 5)
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching store data:', error);
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

  const RatingCard = ({ rating }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <RatingStars rating={rating.rating} size="sm" readOnly />
          <span className="font-medium text-gray-900">{rating.user_name}</span>
        </div>
        <span className="text-sm text-gray-500">
          <Calendar className="h-4 w-4 inline mr-1" />
          {new Date(rating.created_at).toLocaleDateString()}
        </span>
      </div>
      
      {rating.comment && (
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700 text-sm">{rating.comment}</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Store Found</h1>
          <p className="text-gray-600 mb-4">
            You don't have a store assigned to your account. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Owner Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's how your store is performing.</p>
      </div>

      {/* Store Info Card */}
      <div className="card mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{store.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Store className="h-5 w-5" />
                  <span>{store.address}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>Owner: {user?.name}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="flex items-center justify-center lg:justify-end gap-2 mb-2">
                <Star className="h-8 w-8 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : 'No ratings'}
                </span>
              </div>
              <p className="text-gray-600">
                {stats.totalRatings} rating{stats.totalRatings !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Ratings"
          value={stats.totalRatings}
          icon={Star}
          color="text-yellow-600"
          description="Total ratings received"
        />
        
        <StatCard
          title="Average Rating"
          value={stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          icon={TrendingUp}
          color="text-green-600"
          description="Overall store rating"
        />
        
        <StatCard
          title="Active Users"
          value={ratings.length > 0 ? new Set(ratings.map(r => r.user_id)).size : 0}
          icon={Users}
          color="text-blue-600"
          description="Unique users who rated"
        />
      </div>

      {/* Recent Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Ratings</h3>
            <div className="space-y-4">
              {stats.recentRatings.length > 0 ? (
                stats.recentRatings.map(rating => (
                  <RatingCard key={rating.id} rating={rating} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No ratings yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratings.filter(r => r.rating === stars).length;
                const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                    
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="w-12 text-right">
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {stats.totalRatings === 0 && (
              <p className="text-gray-500 text-center py-8">No ratings to display</p>
            )}
          </div>
        </div>
      </div>

      {/* All Ratings Table */}
      <div className="card mt-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Ratings</h3>
          
          {ratings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ratings.map(rating => (
                    <tr key={rating.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {rating.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rating.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={rating.rating} size="sm" readOnly />
                          <span className="text-sm font-medium text-gray-900">
                            {rating.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {rating.comment || 'No comment'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No ratings yet. Encourage your customers to rate your store!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Manage your store:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => window.location.href = '/profile'}
            className="btn btn-primary"
          >
            Update Profile
          </button>
          <button
            onClick={() => window.location.href = '/stores'}
            className="btn btn-secondary"
          >
            View All Stores
          </button>
        </div>
      </div>
    </div>
  );
};

// RatingStars component (simplified version for this component)
const RatingStars = ({ rating, size = "md", readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map(star => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default StoreOwnerDashboard;
