// contactRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/message', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Save message to database
        await db.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );

        res.json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

module.exports = router;