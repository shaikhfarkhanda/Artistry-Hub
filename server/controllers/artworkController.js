// artworkController.js
const db = require('../config/db');
const path = require('path');

// Upload artwork
exports.uploadArtwork= async (req, res) => {
    try {
        const { title, type, description, price } = req.body;
        
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded'
            });
        }

        const image = req.files.image;
        const fileName = `artwork-${Date.now()}${path.extname(image.name)}`;
        const uploadPath = path.join(__dirname, '../public/images', fileName);

        // Save image
        await image.mv(uploadPath);
        const imageUrl = `/images/${fileName}`;
        // Add console.log to debug
        console.log('User ID:', req.user.id);
        console.log('Upload Data:', { title, type, description, price });

        // Save to database
        const [result] = await db.query(
            `INSERT INTO artworks (artist_id, title, type, description, price, image_url, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [req.user.id, title, type, description, price, `/images/${fileName}`]
        );

        console.log('Upload Result:', result);

        res.json({
            success: true,
            message: 'Artwork uploaded successfully and pending approval'
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading artwork'
        });
    }
};
// Get artworks with filters
exports.getArtworks = async (req, res) => {
    try {
        const { type, priceFilter, search } = req.query;
        let query = 'SELECT *, CAST(price AS DECIMAL(10,2)) as price FROM artworks WHERE status = "approved"';
        const params = [];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (priceFilter) {
            const [min, max] = priceFilter.split('-');
            if (max) {
                query += ' AND price BETWEEN ? AND ?';
                params.push(parseFloat(min), parseFloat(max));
            } else {
                query += ' AND price >= ?';
                params.push(parseFloat(min));
            }
        }

        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        console.log('Query:', query);
        console.log('Parameters:', params);

        const [artworks] = await db.query(query, params);
        
        // Convert prices to numbers explicitly
        const processedArtworks = artworks.map(artwork => ({
            ...artwork,
            price: parseFloat(artwork.price)
        }));

        console.log('Processed artworks:', processedArtworks);

        res.json({
            success: true,
            artworks: processedArtworks
        });
    } catch (error) {
        console.error('Error fetching artworks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching artworks'
        });
    }
};

// Get artist's artworks
exports.getMyArtworks = async (req, res) => {
    try {
        const [artworks] = await db.query(
            'SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            artworks
        });
    } catch (error) {
        console.error('Error fetching artworks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your artworks'
        });
    }
};

// Get artwork details
exports.getArtworkDetails = async (req, res) => {
    try {
        const [artwork] = await db.query(
            `SELECT a.*, u.username as artist_name 
             FROM artworks a 
             JOIN users u ON a.artist_id = u.id 
             WHERE a.artwork_id = ? AND a.status = 'approved'`,
            [req.params.id]
        );

        // Debug log
        console.log('Fetched artwork details:', artwork[0]);

        if (!artwork || artwork.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Artwork not found'
            });
        }

        // Process the artwork data
        const processedArtwork = {
            ...artwork[0],
            price: parseFloat(artwork[0].price)
        };

        res.json({
            success: true,
            artwork: processedArtwork
        });
    } catch (error) {
        console.error('Error fetching artwork details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching artwork details'
        });
    }
};

// Get artist's sales history
exports.getSalesHistory = async (req, res) => {
    try {
        const [sales] = await db.query(`
            SELECT 
                o.order_id,
                o.order_date,
                a.title,
                a.price,
                o.quantity,
                (a.price * o.quantity) as total_amount,
                u.username as buyer_name
            FROM orders o
            JOIN artworks a ON o.artwork_id = a.artwork_id
            JOIN users u ON o.id = u.id
            WHERE a.artist_id = ?
            ORDER BY o.order_date DESC
        `, [req.user.id]);

        res.json({
            success: true,
            sales
        });
    } catch (error) {
        console.error('Error fetching sales history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales history'
        });
    }
};

// Update artwork
exports.updateArtwork = async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const artworkId = req.params.id;

        // Check ownership
        const [artwork] = await db.query(
            'SELECT * FROM artworks WHERE artwork_id = ? AND artist_id = ?',
            [artworkId, req.user.id]
        );

        if (artwork.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this artwork'
            });
        }

        await db.query(
            'UPDATE artworks SET title = ?, description = ?, price = ? WHERE artwork_id = ?',
            [title, description, price, artworkId]
        );

        res.json({
            success: true,
            message: 'Artwork updated successfully'
        });
    } catch (error) {
        console.error('Error updating artwork:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating artwork'
        });
    }
};

// Delete artwork
exports.deleteArtwork = async (req, res) => {
    try {
        const artworkId = req.params.id;

        // Check ownership
        const [artwork] = await db.query(
            'SELECT * FROM artworks WHERE artwork_id = ? AND artist_id = ?',
            [artworkId, req.user.id]
        );

        if (artwork.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this artwork'
            });
        }

        await db.query(
            'DELETE FROM artworks WHERE artwork_id = ?',
            [artworkId]
        );

        res.json({
            success: true,
            message: 'Artwork deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting artwork:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting artwork'
        });
    }
};

module.exports = exports;