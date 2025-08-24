import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, User, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RatingStars from '../common/RatingStars';
import axios from 'axios';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchStoreDetails();
    if (user) {
      fetchUserRating();
    }
  }, [id, user]);

  const fetchStoreDetails = async () => {
    try {
      const response = await axios.get(`/api/stores/${id}`);
      setStore(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching store details:', error);
      setLoading(false);
    }
  };

  const fetchUserRating = async () => {
    try {
      const response = await axios.get(`/api/ratings/store/${id}`);
      if (response.data) {
        setUserRating(response.data);
        setNewRating(response.data.rating);
        setComment(response.data.comment || '');
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const fetchStoreRatings = async () => {
    try {
      const response = await axios.get(`/api/ratings/store/${id}/all`);
      setRatings(response.data);
    } catch (error) {
      console.error('Error fetching store ratings:', error);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      if (userRating) {
        // Update existing rating
        await axios.put(`/api/ratings/${userRating.id}`, {
          rating: newRating,
          comment: comment
        });
      } else {
        // Create new rating
        await axios.post('/api/ratings', {
          storeId: id,
          rating: newRating,
          comment: comment
        });
      }
      
      // Refresh data
      fetchStoreDetails();
      fetchUserRating();
      fetchStoreRatings();
      setShowRatingForm(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleDeleteRating = async () => {
    if (!userRating) return;
    
    try {
      await axios.delete(`/api/ratings/${userRating.id}`);
      setUserRating(null);
      setNewRating(0);
      setComment('');
      fetchStoreDetails();
      fetchStoreRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
    }
  };

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
          <p className="text-gray-500 text-lg">Store not found.</p>
          <button
            onClick={() => navigate('/stores')}
            className="btn btn-primary mt-4"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/stores')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Stores
      </button>

      {/* Store Header */}
      <div className="card mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{store.name}</h1>
              
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{store.address}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <User className="h-5 w-5" />
                <span>Owner: {store.owner_name || 'Unknown'}</span>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="flex items-center justify-center lg:justify-end gap-2 mb-2">
                <Star className="h-8 w-8 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold">
                  {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}
                </span>
              </div>
              <p className="text-gray-600">
                {store.totalRatings || 0} rating{store.totalRatings !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Rating Section */}
      {user && (
        <div className="card mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Rating</h2>
            
            {!showRatingForm && (
              <div className="flex items-center justify-between">
                <div>
                  {userRating ? (
                    <div className="flex items-center gap-4">
                      <RatingStars rating={userRating.rating} size="lg" readOnly />
                      <span className="text-gray-600">{userRating.comment}</span>
                    </div>
                  ) : (
                    <p className="text-gray-500">You haven't rated this store yet.</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="btn btn-primary"
                  >
                    {userRating ? 'Edit Rating' : 'Rate This Store'}
                  </button>
                  
                  {userRating && (
                    <button
                      onClick={handleDeleteRating}
                      className="btn btn-danger"
                    >
                      Delete Rating
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {showRatingForm && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">Rating:</label>
                  <RatingStars
                    rating={newRating}
                    onRatingChange={setNewRating}
                    size="lg"
                  />
                </div>
                
                <div>
                  <label className="form-label">Comment (optional):</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    rows="3"
                    placeholder="Share your experience with this store..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleRatingSubmit}
                    className="btn btn-primary"
                  >
                    {userRating ? 'Update Rating' : 'Submit Rating'}
                  </button>
                  
                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Ratings Section */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Ratings</h2>
          
          {ratings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No ratings yet. Be the first to rate this store!</p>
          ) : (
            <div className="space-y-4">
              {ratings.map(rating => (
                <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={rating.rating} size="sm" readOnly />
                      <span className="font-medium">{rating.user_name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {new Date(rating.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-700 ml-6">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetail;
