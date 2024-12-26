// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isBuyer } = require('../middleware/authMiddleware');

// Buyer only routes
router.post('/create', authenticate, isBuyer, orderController.createOrder);
router.get('/my-orders', authenticate, isBuyer, orderController.getMyOrders);

router.get('/order/:orderId', authenticate, orderController.getOrderDetails);
router.get('/bill/:orderId', authenticate, orderController.getBill);

// Artist routes
router.get('/payouts', authenticate, orderController.getArtistPayouts);

module.exports = router;