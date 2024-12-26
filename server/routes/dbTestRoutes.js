// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// router.get('/test-db', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT 1 + 1 AS result');
//         res.json({ success: true, result: rows[0].result });
//     } catch (err) {
//         console.error('Database Test Error:', err.message);
//         res.status(500).json({ success: false, message: 'Database connection failed' });
//     }
// });

// module.exports = router;

// dbTestRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/test-db', async (req, res) => {
    try {
        const [result] = await db.query('SELECT 1 + 1 AS result');
        res.json({
            success: true,
            result: result[0].result
        });
    } catch (err) {
        console.error('Database Test Error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

module.exports = router;