const express = require('express');
const router = express.Router();
const { getUserProfile, getPublicSellerProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.get('/seller/:id', getPublicSellerProfile); 

module.exports = router;