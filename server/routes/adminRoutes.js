// adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All admin routes need both authentication and admin role check
router.use(authenticate, isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/pending-artworks', adminController.getPendingArtworks);
router.get('/users', adminController.getAllUsers);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Artwork management
router.get('/pending-artworks', adminController.getPendingArtworks);
router.get('/approved-artworks', adminController.getApprovedArtworks);
router.put('/artwork-status/:id', adminController.updateArtworkStatus);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/user-status/:id', adminController.updateUserStatus);
router.delete('/user/:id', adminController.deleteUser);

// Order management
router.get('/orders', adminController.getAllOrders);
router.put('/order-status/:id', adminController.updateOrderStatus);

// Commission management
router.get('/commissions', adminController.getCommissionReport);

module.exports = router;