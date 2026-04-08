const User = require('../models/User');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const logActivity = require('../utils/logger');

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find({ status: 'published' });
    const totalRevenue = orders.reduce((acc, order) => acc + order.price, 0);

    const recentOrders = await Order.find()
      .populate('buyer', 'name')
      .populate('listing', 'url')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalListings,
        totalOrders,
        totalRevenue,
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const { role, isSuspended } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = role || user.role;
      user.isSuspended = isSuspended !== undefined ? isSuspended : user.isSuspended;
      
      const updatedUser = await user.save();
      await logActivity(req.user.id, "USER_MODERATED", user._id, `Updated role to ${user.role} or suspended status.`);
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFeaturedListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    listing.isFeatured = !listing.isFeatured;
    if (listing.isFeatured) {
      listing.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await listing.save();
    await logActivity(req.user.id, "LISTING_FEATURED", listing._id, `Set ${listing.url} featured: ${listing.isFeatured}`);
    res.json(listing);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyListingMetrics = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (listing) {
      listing.isVerified = true;
      listing.lastVerifiedAt = Date.now();
      await listing.save();
      await logActivity(req.user.id, "METRICS_VERIFIED", listing._id, `Verified ${listing.url}`);
      res.json(listing);
    } else { res.status(404).json({ message: 'Listing not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getPlatformStats, getAllUsers, updateUserByAdmin, toggleFeaturedListing, verifyListingMetrics };