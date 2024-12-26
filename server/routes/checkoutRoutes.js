// checkoutRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkoutController = require('../controllers/checkoutController');

// All routes require authentication
router.use(authenticate);

// Create payment session
router.post('/session', checkoutController.createCheckoutSession);

// Process payment
router.post('/payment', checkoutController.processPayment);

// Handle payment success
router.post('/payment/success', checkoutController.handlePaymentSuccess);

// Handle payment failure
router.post('/payment/failure', checkoutController.handlePaymentFailure);

// Get bills
router.get('/bills/:userId', checkoutController.getBills);

// Process COD order
router.post('/cod', checkoutController.processCODOrder);

module.exports = router;