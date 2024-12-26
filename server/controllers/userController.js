// userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// User registration
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    try {
        // Check if email exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, username, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                role
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

// User login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];

        // Get additional info if artist
        if (user.role === 'artist') {
            const [artistInfo] = await db.query(
                'SELECT * FROM artists WHERE id = ?',
                [user.id]
            );
            if (artistInfo.length > 0) {
                user.artistInfo = artistInfo[0];
            }
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    const { username, biography, contact } = req.body;

    try {
        await db.query(
            'UPDATE users SET username = ? WHERE id = ?',
            [username, req.user.id]
        );

        if (req.user.role === 'artist') {
            await db.query(`
                INSERT INTO artists (id, biography, contact)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE
                biography = VALUES(biography),
                contact = VALUES(contact)
            `, [req.user.id, biography, contact]);
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
};

module.exports = exports;