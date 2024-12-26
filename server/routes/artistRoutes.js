// artistRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, isArtist } = require('../middleware/authMiddleware');
const db = require('../config/db');

// Get artist dashboard stats
router.get('/stats', authenticate, isArtist, async (req, res) => {
    try {
        console.log('Artist ID:', req.user.id);

        const [result] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM artworks WHERE artist_id = ?) as total_artworks,
                (SELECT COUNT(*) FROM artworks WHERE artist_id = ? AND status = 'approved') as approved_artworks,
                (SELECT COUNT(*) FROM artworks WHERE artist_id = ? AND status = 'pending') as pending_artworks,
                (SELECT COUNT(*) FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN artworks a ON oi.artwork_id = a.artwork_id
                WHERE a.artist_id = ?) as total_sales
        `, [req.user.id, req.user.id, req.user.id, req.user.id]);

        console.log('Query result:', result);

        res.json({
            success: true,
            stats: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get artist's pending payouts
router.get('/pending-payouts', authenticate, isArtist, async (req, res) => {
    try {
        const [payouts] = await db.query(`
            SELECT 
                oi.order_id,
                o.order_date,
                a.title,
                oi.quantity,
                oi.artist_amount,
                (oi.quantity * oi.artist_amount) as total_amount,
                o.status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            WHERE a.artist_id = ? AND o.status = 'confirmed'
            ORDER BY o.order_date DESC
        `, [req.user.id]);

        res.json({
            success: true,
            payouts
        });
    } catch (error) {
        console.error('Error fetching pending payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payouts'
        });
    }
});

router.get('/my-artworks', authenticate, async (req, res) => {
    try {
        // Add console.log for debugging
        console.log('Fetching artworks for artist:', req.user.id);

        const [artworks] = await db.query(`
            SELECT * FROM artworks 
            WHERE artist_id = ?
            ORDER BY created_at DESC`,
            [req.user.id]
        );

        console.log('Found artworks:', artworks);

        res.json({
            success: true,
            artworks
        });
    } catch (error) {
        console.error('Error fetching artworks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching artworks'
        });
    }
});
// Update artist profile
router.put('/profile', authenticate, isArtist, async (req, res) => {
    try {
        const { biography, contact } = req.body;

        await db.query(`
            INSERT INTO artists (id, biography, contact)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
            biography = VALUES(biography),
            contact = VALUES(contact)
        `, [req.user.id, biography, contact]);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

module.exports = router;