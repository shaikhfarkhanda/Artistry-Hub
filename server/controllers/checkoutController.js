// controllers/checkoutController.js
const db = require('../config/db');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { cart } = req.body;
        const shippingCost = 100;
        let totalAmount = 0;

        // Calculate total
        cart.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        totalAmount += shippingCost;

        res.json({
            success: true,
            totalAmount,
            shippingCost
        });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout session'
        });
    }
};

exports.processPayment = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { items, totalAmount, paymentMethod, shippingCost } = req.body;

        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (id, total_price, shipping_cost, payment_method, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, totalAmount, shippingCost, paymentMethod, 'confirmed']
        );

        await connection.commit();
        res.json({
            success: true,
            orderId: orderResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Payment failed'
        });
    } finally {
        connection.release();
    }
};

exports.handlePaymentSuccess = async (req, res) => {
    try {
        const { orderId } = req.body;
        await db.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            ['completed', orderId]
        );

        res.json({
            success: true,
            message: 'Payment successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing payment success'
        });
    }
};

exports.handlePaymentFailure = async (req, res) => {
    try {
        const { orderId } = req.body;
        await db.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            ['failed', orderId]
        );

        res.json({
            success: true,
            message: 'Payment failure recorded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing payment failure'
        });
    }
};

exports.getBills = async (req, res) => {
    try {
        const [bills] = await db.query(`
            SELECT o.*, oi.quantity, oi.price, a.title, a.image_url
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            WHERE o.id = ?
            ORDER BY o.order_date DESC`,
            [req.params.userId]
        );

        res.json({
            success: true,
            bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bills'
        });
    }
};

exports.processCODOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { items, totalAmount, deliveryAddress, contactNumber } = req.body;
        const shippingCost = 100;

        await connection.beginTransaction();

        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (id, total_price, shipping_cost, payment_method, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, totalAmount, shippingCost, 'COD', 'pending']
        );

        // Add delivery info
        await connection.query(
            'INSERT INTO delivery_info (order_id, address, contact) VALUES (?, ?, ?)',
            [orderResult.insertId, deliveryAddress, contactNumber]
        );

        await connection.commit();
        res.json({
            success: true,
            orderId: orderResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Failed to process COD order'
        });
    } finally {
        connection.release();
    }
};

module.exports = exports;