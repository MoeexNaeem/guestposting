const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

const { 
  getPlatformStats, 
  getAllUsers, 
  updateUserByAdmin,
  toggleFeaturedListing, // Added
  verifyListingMetrics   // Added
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getPlatformStats);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUserByAdmin);

// Added verification and feature routes
router.put('/listings/:id/feature', protect, admin, toggleFeaturedListing);
router.put('/listings/:id/verify', protect, admin, verifyListingMetrics);

router.get('/logs', protect, admin, async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;