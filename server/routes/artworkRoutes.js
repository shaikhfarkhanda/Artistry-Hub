// artworkRoutes.js
const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const { authenticate, isArtist } = require('../middleware/authMiddleware');

// Public routes
router.get('/artworks', artworkController.getArtworks);
router.get('/artworks/:id', artworkController.getArtworkDetails);

// Artist routes
router.post('/upload', authenticate, isArtist, artworkController.uploadArtwork);
router.get('/my-artworks', authenticate, isArtist, artworkController.getMyArtworks);
router.get('/sales-history', authenticate, isArtist, artworkController.getSalesHistory);
router.put('/artwork/:id', authenticate, isArtist, artworkController.updateArtwork);
router.delete('/artwork/:id', authenticate, isArtist, artworkController.deleteArtwork);

module.exports = router;