// orderController.js
const db = require('../config/db');

// Create new order
exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { items, totalAmount, paymentMethod, deliveryAddress, contactNumber } = req.body;
        
        console.log('Order Data Received:', {
            items,
            totalAmount,
            paymentMethod,
            deliveryAddress,
            contactNumber
        });
 
        const userId = req.user.id;
        const shippingCost = 100;
 
        await connection.beginTransaction();
 
        const [orderResult] = await connection.query(
            `INSERT INTO orders (id, total_price, shipping_cost, payment_method, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, totalAmount, shippingCost, paymentMethod, 'pending']
        );
 
        const orderId = orderResult.insertId;
 
        for (const item of items) {
            const itemPrice = Number(item.price);
            const commission = itemPrice * 0.15;
            const artistAmount = itemPrice - commission;
 
            await connection.query(
                `INSERT INTO order_items 
                (order_id, artwork_id, quantity, price, commission, artist_amount) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.artwork_id, item.quantity, itemPrice, commission, artistAmount]
            );
 
            await connection.query(
                `UPDATE artist_accounts 
                SET balance = balance + ? 
                WHERE artist_id = (
                    SELECT artist_id FROM artworks WHERE artwork_id = ?
                )`,
                [artistAmount * item.quantity, item.artwork_id]
            );
        }
 
        if (deliveryAddress && contactNumber) {
            await connection.query(
                'INSERT INTO delivery_info (order_id, address, contact) VALUES (?, ?, ?)',
                [orderId, deliveryAddress, contactNumber]
            );
        }
 
        await connection.commit();
        res.json({
            success: true,
            message: 'Order created successfully',
            orderId
        });
 
    } catch (error) {
        await connection.rollback();
        console.error('Order creation failed:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Order creation failed: ' + error.message
        });
    } finally {
        connection.release();
    }
 };

// Get user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                o.*,
                a.title,
                a.image_url,
                oi.quantity,
                oi.price as unit_price,
                o.shipping_cost
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            WHERE o.id = ?
            ORDER BY o.order_date DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
    try {
        const [order] = await db.query(`
            SELECT 
                o.*,
                oi.quantity,
                oi.price as unit_price,
                a.title,
                a.image_url,
                d.address,
                d.contact,
                o.shipping_cost
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            LEFT JOIN delivery_info d ON o.order_id = d.order_id
            WHERE o.order_id = ? AND o.id = ?`,
            [req.params.orderId, req.user.id]
        );

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order: order[0]
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details'
        });
    }
};

// Get order bill
exports.getBill = async (req, res) => {
    try {
        const [bills] = await db.query(`
            SELECT 
                b.*,
                a.title,
                a.image_url,
                o.order_date,
                o.payment_method,
                o.shipping_cost
            FROM bills b
            JOIN artworks a ON b.artwork_id = a.artwork_id
            JOIN orders o ON b.order_id = o.order_id
            WHERE b.order_id = ? AND b.buyer_id = ?`,
            [req.params.orderId, req.user.id]
        );

        if (bills.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        res.json({
            success: true,
            bills
        });
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bill'
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.orderId;

        await db.query(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [status, orderId]
        );

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};

// Get artist payouts
exports.getArtistPayouts = async (req, res) => {
    try {
        const [payouts] = await db.query(`
            SELECT 
                oi.artist_amount,
                oi.commission,
                o.order_date,
                a.title,
                oi.quantity,
                (oi.artist_amount * oi.quantity) as total_payout
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            WHERE a.artist_id = ?
            ORDER BY o.order_date DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            payouts
        });
    } catch (error) {
        console.error('Error fetching payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payouts'
        });
    }
};

module.exports = exports;