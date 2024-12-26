// controllers/adminController.js
const db = require('../config/db');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users');
        const [[artistCount]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "artist"');
        const [[pendingCount]] = await db.query('SELECT COUNT(*) as count FROM artworks WHERE status = "pending"');
        const [[salesCount]] = await db.query('SELECT COUNT(*) as count FROM orders');

        console.log({
            users: userCount.count,
            artists: artistCount.count,
            pending: pendingCount.count,
            sales: salesCount.count
        });

        res.json({
            success: true,
            stats: {
                total_users: userCount.count,
                artists_count: artistCount.count,
                pending_approvals: pendingCount.count,
                total_sales: salesCount.count
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get pending artworks
exports.getPendingArtworks = async (req, res) => {
    try {
        const [artworks] = await db.query(`
            SELECT 
                a.artwork_id,
                a.title,
                a.type,
                a.description,
                a.price,
                CONCAT('http://localhost:3000', a.image_url) as image_url,
                a.status,
                a.created_at,
                u.username as artist_name 
            FROM artworks a 
            JOIN users u ON a.artist_id = u.id 
            WHERE a.status = 'pending' 
            ORDER BY a.created_at DESC
        `);

        res.json({
            success: true,
            artworks
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending artworks'
        });
    }
};

exports.getApprovedArtworks = async (req, res) => {
    try {
        const [artworks] = await db.query(`
            SELECT 
                a.artwork_id,
                a.title,
                a.type,
                a.description,
                a.price,
                CONCAT('http://localhost:3000', a.image_url) as image_url,
                a.status,
                a.created_at,
                u.username as artist_name 
            FROM artworks a 
            JOIN users u ON a.artist_id = u.id 
            WHERE a.status = 'approved' 
            ORDER BY a.created_at DESC
        `);

        res.json({
            success: true,
            artworks
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approved artworks'
        });
    }
};

// Update artwork status
exports.updateArtworkStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const artworkId = req.params.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query(
            'UPDATE artworks SET status = ? WHERE artwork_id = ?',
            [status, artworkId]
        );

        res.json({
            success: true,
            message: `Artwork ${status} successfully`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update artwork status'
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT 
                id,
                username,
                email,
                role,
                status,
                created_at
            FROM users 
            WHERE id != ?  /* Exclude current admin */
            ORDER BY created_at DESC
        `, [req.user.id]);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.params.id;

        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );

        res.json({
            success: true,
            message: `User ${status} successfully`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.params.id;

        // Delete user's artworks
        await connection.query(
            'DELETE FROM artworks WHERE artist_id = ?',
            [userId]
        );

        // Delete user
        await connection.query(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    } finally {
        connection.release();
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, u.username as buyer_name
            FROM orders o
            JOIN users u ON o.id = u.id
            ORDER BY o.order_date DESC
        `);

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        await db.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [status, orderId]
        );

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};

// Get commission report
exports.getCommissionReport = async (req, res) => {
    try {
        const [report] = await db.query(`
            SELECT 
                DATE_FORMAT(o.order_date, '%Y-%m') as month,
                COUNT(DISTINCT o.order_id) as total_orders,
                SUM(oi.commission) as total_commission,
                SUM(oi.artist_amount) as total_artist_amount,
                SUM(o.shipping_cost) as total_shipping
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            WHERE o.status = 'completed'
            GROUP BY month
            ORDER BY month DESC
        `);

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate commission report'
        });
    }
};

module.exports = exports;