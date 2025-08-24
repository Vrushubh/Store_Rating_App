const express = require('express');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get all stores with average ratings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const queryParams = [userId];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.address LIKE ?`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY s.id`;

    // Validate sort parameters
    const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = 'name';
    }

    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'ASC';
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await pool.execute(query, queryParams);

    res.json({ stores });
  } catch (error) {
    console.error('Stores fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store by ID with detailed information
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;

    const [stores] = await pool.execute(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.id = ?
      GROUP BY s.id
    `, [userId, storeId]);

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get recent ratings for this store
    const [ratings] = await pool.execute(`
      SELECT r.rating, r.comment, r.created_at,
             u.name as user_name, u.role as user_role
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [storeId]);

    const store = stores[0];
    store.recent_ratings = ratings;

    res.json({ store });
  } catch (error) {
    console.error('Store fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Search stores by name and address
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const queryParams = [userId];

    if (name) {
      query += ` AND s.name LIKE ?`;
      queryParams.push(`%${name}%`);
    }

    if (address) {
      query += ` AND s.address LIKE ?`;
      queryParams.push(`%${address}%`);
    }

    query += ` GROUP BY s.id`;

    // Validate sort parameters
    const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = 'name';
    }

    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'ASC';
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await pool.execute(query, queryParams);

    res.json({ stores });
  } catch (error) {
    console.error('Store search error:', error);
    res.status(500).json({ error: 'Failed to search stores' });
  }
});

// Get store owner's store information
router.get('/owner/store', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Only store owners can access this endpoint' });
    }

    const [stores] = await pool.execute(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [userId]);

    if (stores.length === 0) {
      return res.status(404).json({ error: 'No store found for this user' });
    }

    // Get all ratings for this store
    const [ratings] = await pool.execute(`
      SELECT r.rating, r.comment, r.created_at,
             u.name as user_name, u.role as user_role
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [stores[0].id]);

    const store = stores[0];
    store.ratings = ratings;

    res.json({ store });
  } catch (error) {
    console.error('Store owner store fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store information' });
  }
});

module.exports = router;
