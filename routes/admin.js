const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserCreationByAdmin, validateStoreCreation } = require('../middleware/validation');
const { pool } = require('../config/database');

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken, requireAdmin);

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users count
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    // Get total stores count
    const [storeCount] = await pool.execute('SELECT COUNT(*) as count FROM stores');
    
    // Get total ratings count
    const [ratingCount] = await pool.execute('SELECT COUNT(*) as count FROM ratings');
    
    // Get users by role
    const [usersByRole] = await pool.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    // Get recent activity
    const [recentRatings] = await pool.execute(`
      SELECT r.rating, r.created_at, u.name as user_name, s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    res.json({
      statistics: {
        totalUsers: userCount[0].count,
        totalStores: storeCount[0].count,
        totalRatings: ratingCount[0].count,
        usersByRole
      },
      recentActivity: recentRatings
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users with filtering and sorting
router.get('/users', async (req, res) => {
  try {
    const { 
      search, 
      role, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE 
               WHEN u.role = 'store_owner' THEN (
                 SELECT COALESCE(AVG(r.rating), 0)
                 FROM stores s
                 LEFT JOIN ratings r ON s.id = r.store_id
                 WHERE s.owner_id = u.id
               )
               ELSE NULL
             END as store_rating
      FROM users u
      WHERE 1=1
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ` AND u.role = ?`;
      queryParams.push(role);
    }

    // Validate sort parameters
    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const allowedSortOrders = ['ASC', 'DESC'];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = 'name';
    }

    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'ASC';
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [users] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM users u
      WHERE 1=1
    `;

    const countParams = [];
    if (search) {
      countQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      countQuery += ` AND u.role = ?`;
      countParams.push(role);
    }

    const [totalCount] = await pool.execute(countQuery, countParams);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalItems: totalCount[0].count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all stores with filtering and sorting
router.get('/stores', async (req, res) => {
  try {
    const { 
      search, 
      sortBy = 'name', 
      sortOrder = 'ASC',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings,
             u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
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

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);

    const [stores] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM stores s
      WHERE 1=1
    `;

    const countParams = [];
    if (search) {
      countQuery += ` AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [totalCount] = await pool.execute(countQuery, countParams);

    res.json({
      stores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount[0].count / limit),
        totalItems: totalCount[0].count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Stores fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Create new user
router.post('/users', validateUserCreationByAdmin, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Create new store
router.post('/stores', validateStoreCreation, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store already exists
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existingStores.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // If ownerId is provided, verify it's a valid user
    if (ownerId) {
      const [users] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ?',
        [ownerId]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid owner ID' });
      }

      if (users[0].role !== 'store_owner') {
        return res.status(400).json({ error: 'Owner must have store_owner role' });
      }
    }

    // Create store
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId || null]
    );

    res.status(201).json({
      message: 'Store created successfully',
      storeId: result.insertId
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user (cascade will handle related data)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete store
router.delete('/stores/:id', async (req, res) => {
  try {
    const storeId = req.params.id;

    // Check if store exists
    const [stores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Delete store (cascade will handle related ratings)
    await pool.execute('DELETE FROM stores WHERE id = ?', [storeId]);

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Store deletion error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

module.exports = router;
