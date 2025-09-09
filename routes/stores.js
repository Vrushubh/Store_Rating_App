const express = require('express');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Allowed sort fields
const allowedSortFields = ['name', 'email', 'address', 'average_rating', 'created_at'];
const allowedSortOrders = ['ASC', 'DESC'];

// -------------------- Get all stores --------------------
router.get('/', authenticateToken, async (req, res) => {
  try {
    let { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name AS owner_name,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
    `;

    const queryParams = [userId];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.address LIKE ?`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY s.id`;

    if (!allowedSortFields.includes(sortBy)) sortBy = 'name';
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'ASC';

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await pool.execute(query, queryParams);
    // ensure numeric values
    stores.forEach(store => {
      store.average_rating = parseFloat(store.average_rating) || 0;
    });

    res.json(stores); // return array directly
  } catch (error) {
    console.error('Stores fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// -------------------- Get store by ID --------------------
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;

    const [stores] = await pool.execute(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name AS owner_name,
             CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(10,2)) as average_rating,
             COUNT(r.id) as total_ratings,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [userId, storeId]);

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const [ratings] = await pool.execute(`
      SELECT r.rating, r.comment, r.created_at,
             u.name as user_name, u.role as user_role
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [storeId]);

    // ensure numeric values
    stores.forEach(store => {
      store.average_rating = parseFloat(store.average_rating) || 0;
    });


    const store = stores[0];
    store.recent_ratings = ratings;

    res.json(store); // return object directly
  } catch (error) {
    console.error('Store fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// -------------------- Search stores --------------------
router.get('/search', authenticateToken, async (req, res) => {
  try {
    let { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name AS owner_name,
             CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(10,2)) as average_rating,
             COUNT(r.id) as total_ratings,
             (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
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

    if (!allowedSortFields.includes(sortBy)) sortBy = 'name';
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'ASC';

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await pool.execute(query, queryParams);

    // ensure numeric values
    stores.forEach(store => {
      store.average_rating = parseFloat(store.average_rating) || 0;
    });


    res.json(stores); // return array directly
  } catch (error) {
    console.error('Store search error:', error);
    res.status(500).json({ error: 'Failed to search stores' });
  }
});

// -------------------- Store owner store info --------------------
router.get('/owner/store', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Only store owners can access this endpoint' });
    }

    const [stores] = await pool.execute(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             u.name AS owner_name,
             CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(10,2)) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [userId]);

    if (stores.length === 0) {
      return res.status(404).json({ error: 'No store found for this user' });
    }

    const [ratings] = await pool.execute(`
      SELECT r.rating, r.comment, r.created_at,
             u.name as user_name, u.role as user_role
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [stores[0].id]);

    // ensure numeric values
    stores.forEach(store => {
      store.average_rating = parseFloat(store.average_rating) || 0;
    });

    const store = stores[0];
    store.ratings = ratings;

    res.json(store); // return object directly
  } catch (error) {
    console.error('Store owner store fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store information' });
  }
});

module.exports = router;
