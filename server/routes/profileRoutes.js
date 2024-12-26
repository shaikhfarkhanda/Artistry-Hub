// profileRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/authMiddleware');

// Get user profile
router.get('/api/user/profile', authenticate, async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get additional artist info if user is an artist
        if (user[0].role === 'artist') {
            const [artistInfo] = await db.query(
                'SELECT biography, contact FROM artists WHERE id = ?',
                [req.user.id]
            );
            if (artistInfo.length > 0) {
                user[0].artistInfo = artistInfo[0];
            }
        }

        res.json(user[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's artworks
router.get('/api/user/artworks', authenticate, async (req, res) => {
    try {
        const [artworks] = await db.query(
            'SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(artworks);
    } catch (error) {
        console.error('Error fetching artworks:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;