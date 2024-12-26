// authMiddleware.js
const jwt = require('jsonwebtoken');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
   try {
       // Get token from header
       const token = req.headers.authorization?.split(' ')[1];

       if (!token) {
           return res.status(401).json({
               success: false,
               message: 'No token provided. Access denied.'
           });
       }

       // Verify token
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
   } catch (error) {
       console.error('Auth error:', error);
       res.status(401).json({
           success: false,
           message: 'Invalid token. Access denied.'
       });
   }
};

// Admin middleware
exports.isAdmin = async (req, res, next) => {
   try {
       if (req.user.role !== 'admin') {
           return res.status(403).json({
               success: false,
               message: 'Access denied. Admin only.'
           });
       }
       next();
   } catch (error) {
       console.error('Admin auth error:', error);
       res.status(403).json({
           success: false,
           message: 'Access denied'
       });
   }
};

// Artist middleware
exports.isArtist = async (req, res, next) => {
   try {
       if (req.user.role !== 'artist') {
           return res.status(403).json({
               success: false,
               message: 'Access denied. Artists only.'
           });
       }
       next();
   } catch (error) {
       console.error('Artist auth error:', error);
       res.status(403).json({
           success: false,
           message: 'Access denied'
       });
   }
};

// Buyer middleware 
exports.isBuyer = async (req, res, next) => {
   try {
       if (req.user.role !== 'buyer') {
           return res.status(403).json({
               success: false,
               message: 'Access denied. Buyers only.'
           });
       }
       next();
   } catch (error) {
       console.error('Buyer auth error:', error);
       res.status(403).json({
           success: false, 
           message: 'Access denied'
       });
   }
};

module.exports = exports;