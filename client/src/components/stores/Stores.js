import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RatingStars from '../common/RatingStars';
import axios from 'axios';

const Stores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    fetchStores();
    if (user) {
      fetchUserRatings();
    }
  }, [user]);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores');
      if (Array.isArray(response.data)) {
        setStores(response.data);
        setError(null);
      } else {
        console.error('Unexpected data format:', response.data);
        setStores([]);
        setError('Invalid data format received from server');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
      setError('Failed to fetch stores. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await axios.get('/api/users/ratings');
      const ratingsMap = {};
      response.data.forEach(rating => {
        ratingsMap[rating.store_id] = rating;
      });
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  const handleRatingSubmit = async (storeId, rating, comment = '') => {
    try {
      const existingRating = userRatings[storeId];
      
      if (existingRating) {
        // Update existing rating
        await axios.put(`/api/ratings/${existingRating.id}`, { rating, comment });
      } else {
        // Create new rating
        await axios.post('/api/ratings', { storeId, rating, comment });
      }
      
      // Refresh user ratings
      fetchUserRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const filteredAndSortedStores = Array.isArray(stores) ? stores
    .filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'averageRating') {
        aValue = a.averageRating || 0;
        bValue = b.averageRating || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Stores</h1>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="address">Address</option>
              <option value="averageRating">Rating</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedStores.map(store => (
          <div key={store.id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{store.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{store.address}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-sm">{store.owner_name || 'Unknown Owner'}</span>
              </div>
              
              {/* User's Rating */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Rating:</p>
                <RatingStars
                  rating={userRatings[store.id]?.rating || 0}
                  onRatingChange={(rating) => handleRatingSubmit(store.id, rating)}
                  size="lg"
                />
                {userRatings[store.id] && (
                  <p className="text-xs text-gray-500 mt-1">
                    You rated this store {userRatings[store.id].rating}/5 stars
                  </p>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {store.totalRatings || 0} rating{store.totalRatings !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

                    {error && (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 text-lg font-medium">Error Loading Stores</p>
                    <p className="text-red-500 mt-2">{error}</p>
                    <button
                      onClick={fetchStores}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
              
              {!error && filteredAndSortedStores.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No stores found matching your search criteria.</p>
                </div>
              )}
    </div>
  );
};

export default Stores;
