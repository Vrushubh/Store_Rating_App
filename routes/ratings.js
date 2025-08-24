const express = require('express');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateRatingSubmission } = require('../middleware/validation');
const { pool } = require('../config/database');

const router = express.Router();

// Submit a rating for a store
router.post('/', authenticateToken, requireUser, validateRatingSubmission, async (req, res) => {
  try {
    const { storeId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [stores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRatings] = await pool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRatings.length > 0) {
      return res.status(400).json({ error: 'You have already rated this store' });
    }

    // Insert new rating
    const [result] = await pool.execute(
      'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, storeId, rating, comment || null]
    );

    res.status(201).json({
      message: 'Rating submitted successfully',
      ratingId: result.insertId
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Update an existing rating
router.put('/:id', authenticateToken, requireUser, validateRatingSubmission, async (req, res) => {
  try {
    const ratingId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if rating exists and belongs to user
    const [existingRatings] = await pool.execute(
      'SELECT id FROM ratings WHERE id = ? AND user_id = ?',
      [ratingId, userId]
    );

    if (existingRatings.length === 0) {
      return res.status(404).json({ error: 'Rating not found or access denied' });
    }

    // Update rating
    await pool.execute(
      'UPDATE ratings SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment || null, ratingId]
    );

    res.json({ message: 'Rating updated successfully' });
  } catch (error) {
    console.error('Rating update error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

// Delete a rating
router.delete('/:id', authenticateToken, requireUser, async (req, res) => {
  try {
    const ratingId = req.params.id;
    const userId = req.user.id;

    // Check if rating exists and belongs to user
    const [existingRatings] = await pool.execute(
      'SELECT id FROM ratings WHERE id = ? AND user_id = ?',
      [ratingId, userId]
    );

    if (existingRatings.length === 0) {
      return res.status(404).json({ error: 'Rating not found or access denied' });
    }

    // Delete rating
    await pool.execute(
      'DELETE FROM ratings WHERE id = ?',
      [ratingId]
    );

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Rating deletion error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

// Get user's rating for a specific store
router.get('/store/:storeId', authenticateToken, requireUser, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.user.id;

    const [ratings] = await pool.execute(
      'SELECT id, rating, comment, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (ratings.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: ratings[0] });
  } catch (error) {
    console.error('Rating fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// Get all ratings for a store (for store owners)
router.get('/store/:storeId/all', authenticateToken, requireUser, async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.user.id;

    // Check if user owns this store
    const [stores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, userId]
    );

    if (stores.length === 0) {
      return res.status(403).json({ error: 'Access denied. You can only view ratings for your own store.' });
    }

    const [ratings] = await pool.execute(`
      SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
             u.name as user_name, u.role as user_role
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);

    res.json({ ratings });
  } catch (error) {
    console.error('Store ratings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch store ratings' });
  }
});

module.exports = router;
