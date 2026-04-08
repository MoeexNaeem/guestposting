const User = require('../models/User');
const Order = require('../models/Order');
const Listing = require('../models/Listing'); 
const Review = require('../models/Review');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    const orders = await Order.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    });

    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'published').length,
      totalVolume: orders
        .filter(o => o.status === 'published')
        .reduce((acc, curr) => acc + curr.price, 0)
    };

    res.json({ user, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPublicSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select('name createdAt role');
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const listings = await Listing.find({ seller: req.params.id, status: 'approved' });

    const reviews = await Review.find({ seller: req.params.id }).populate('buyer', 'name');

    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ seller, listings, reviews, avgRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, getPublicSellerProfile };