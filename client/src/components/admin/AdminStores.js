import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Edit, Trash2, Eye, MapPin, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminStores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [viewingStore, setViewingStore] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchStores();
    fetchUsers();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/admin/stores');
      setStores(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      // Filter to only show store owners and normal users
      const eligibleUsers = response.data.filter(user => 
        user.role === 'store_owner' || user.role === 'user'
      );
      setUsers(eligibleUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/stores', formData);
      setShowCreateForm(false);
      setFormData({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (error) {
      console.error('Error creating store:', error);
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/stores/${editingStore.id}`, formData);
      setEditingStore(null);
      setFormData({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store? This will also delete all associated ratings.')) {
      try {
        await axios.delete(`/api/admin/stores/${storeId}`);
        fetchStores();
      } catch (error) {
        console.error('Error deleting store:', error);
      }
    }
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      owner_id: store.owner_id || ''
    });
  };

  const handleViewStore = async (storeId) => {
    try {
      const response = await axios.get(`/api/admin/stores/${storeId}`);
      setViewingStore(response.data);
    } catch (error) {
      console.error('Error fetching store details:', error);
    }
  };

  const filteredAndSortedStores = stores
    .filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    });

  const StoreForm = ({ onSubmit, title, submitText }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="form-label">Store Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
              maxLength="100"
            />
          </div>
          
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label className="form-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              rows="3"
              required
              maxLength="400"
            />
          </div>
          
          <div>
            <label className="form-label">Owner (Optional)</label>
            <select
              name="owner_id"
              value={formData.owner_id}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">No Owner</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role.replace('_', ' ')}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Assigning an owner will give them store owner privileges
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {submitText}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setEditingStore(null);
                setFormData({ name: '', email: '', address: '', owner_id: '' });
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const StoreDetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Store Details</h3>
        
        {viewingStore && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Store Name</label>
                <p className="text-gray-900">{viewingStore.name}</p>
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <p className="text-gray-900">{viewingStore.email}</p>
              </div>
              
              <div>
                <label className="form-label">Owner</label>
                <p className="text-gray-900">
                  {viewingStore.owner_name || 'No owner assigned'}
                </p>
              </div>
              
              <div>
                <label className="form-label">Registered</label>
                <p className="text-gray-900">
                  {new Date(viewingStore.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div>
              <label className="form-label">Address</label>
              <p className="text-gray-900">{viewingStore.address}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Average Rating</label>
                <p className="text-gray-900">
                  {viewingStore.averageRating ? viewingStore.averageRating.toFixed(1) : 'No ratings'}
                </p>
              </div>
              
              <div>
                <label className="form-label">Total Ratings</label>
                <p className="text-gray-900">{viewingStore.totalRatings || 0}</p>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={() => setViewingStore(null)}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Stores</h1>
          <p className="text-gray-600">View and manage all stores in the system</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary mt-4 sm:mt-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Store
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="card mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search stores by name, address, or email..."
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
                <option value="email">Email</option>
                <option value="averageRating">Rating</option>
                <option value="created_at">Created Date</option>
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
      </div>

      {/* Stores Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      <div className="text-sm text-gray-500">{store.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {store.owner_name || 'No owner'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {store.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {store.averageRating ? store.averageRating.toFixed(1) : 'No ratings'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({store.totalRatings || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewStore(store.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditStore(store)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Store"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Store"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedStores.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No stores found matching your criteria.</p>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <StoreForm
          onSubmit={handleCreateStore}
          title="Create New Store"
          submitText="Create Store"
        />
      )}
      
      {editingStore && (
        <StoreForm
          onSubmit={handleUpdateStore}
          title="Edit Store"
          submitText="Update Store"
        />
      )}
      
      {viewingStore && <StoreDetailModal />}
    </div>
  );
};

export default AdminStores;
