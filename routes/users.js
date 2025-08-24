const express = require('express');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(
      'SELECT id, name, email, role, address, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address } = req.body;

    // Validate input
    if (name && (name.length < 20 || name.length > 60)) {
      return res.status(400).json({ error: 'Name must be between 20 and 60 characters' });
    }

    if (address && address.length > 400) {
      return res.status(400).json({ error: 'Address must not exceed 400 characters' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (address) {
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(userId);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Get user's rating history
router.get('/ratings', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const [ratings] = await pool.execute(`
      SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
             s.id as store_id, s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json({ ratings });
  } catch (error) {
    console.error('Rating history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch rating history' });
  }
});

// Get user's store (if store owner)
router.get('/store', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Only store owners can access this endpoint' });
    }

    const [stores] = await pool.execute(`
      SELECT id, name, email, address, created_at
      FROM stores
      WHERE owner_id = ?
    `, [userId]);

    if (stores.length === 0) {
      return res.status(404).json({ error: 'No store found for this user' });
    }

    res.json({ store: stores[0] });
  } catch (error) {
    console.error('Store fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

module.exports = router;
