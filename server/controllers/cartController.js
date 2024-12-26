// cartController.js
const db = require('../config/db');

exports.getCart = async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT c.*, a.title, a.price, a.image_url 
            FROM cart c
            JOIN artworks a ON c.artwork_id = a.artwork_id
            WHERE c.id = ?
        `, [req.user.id]);
        
        res.json({ 
            success: true, 
            items 
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart'
        });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { artwork_id, quantity } = req.body;
        
        // Check if artwork exists and is approved
        const [artwork] = await db.query(
            'SELECT * FROM artworks WHERE artwork_id = ? AND status = "approved"',
            [artwork_id]
        );

        if (!artwork.length) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found or not available'
            });
        }

        // Add or update cart item
        await db.query(`
            INSERT INTO cart (id, artwork_id, quantity) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + ?
        `, [req.user.id, artwork_id, quantity, quantity]);
        
        res.json({
            success: true,
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart'
        });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { artworkId } = req.params;

        await db.query(
            'UPDATE cart SET quantity = ? WHERE id = ? AND artwork_id = ?',
            [quantity, req.user.id, artworkId]
        );
        
        res.json({
            success: true,
            message: 'Cart updated successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart'
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM cart WHERE id = ? AND artwork_id = ?',
            [req.user.id, req.params.artworkId]
        );
        
        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item'
        });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM cart WHERE id = ?',
            [req.user.id]
        );
        
        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
};

module.exports = exports;