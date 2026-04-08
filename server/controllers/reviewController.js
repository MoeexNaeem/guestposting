const Review = require('../models/Review');
const Order = require('../models/Order');

const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.status !== 'published') {
      return res.status(400).json({ message: 'You can only review completed orders' });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Only the buyer can leave a review' });
    }

    const review = await Review.create({
      order: orderId,
      buyer: req.user.id,
      seller: order.seller,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.id })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getSellerReviews };