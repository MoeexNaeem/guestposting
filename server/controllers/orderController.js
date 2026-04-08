const Order = require('../models/Order');
const Listing = require('../models/Listing');
const sendEmail = require('../utils/sendEmail');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createOrder = async (req, res) => {
  try {
    const { listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot buy your own listing' });
    }

    const order = await Order.create({
      listing: listing._id,
      buyer: req.user.id,
      seller: listing.seller,
      price: listing.price,
      status: 'awaiting_content'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('listing', 'url category')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMySales = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('listing', 'url category')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('listing', 'url category price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer._id.toString() !== req.user.id && order.seller._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderContent = async (req, res) => {
  try {
    const { targetUrl, anchorText } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.buyer.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      order.targetUrl = targetUrl;
      order.anchorText = anchorText;
      order.status = 'in_progress';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('listing', 'url');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the seller can reject the order
    if (order.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    order.status = 'cancelled';
    await order.save();

    // Notify Buyer
    await Notification.create({
      recipient: order.buyer,
      sender: req.user.id,
      type: 'order_update',
      message: `Your order for ${order.listing.url} was rejected by the seller.`,
      link: `/orders/${order._id}`,
    });

    try {
      const buyer = await User.findById(order.buyer);
      await sendEmail({
        email: buyer.email,
        subject: `Order Update: ${order.listing.url}`,
        html: `<p>Your order for <strong>${order.listing.url}</strong> has been cancelled by the seller. Please contact them via chat for details.</p>`
      });
    } catch (err) { console.log("Email failed"); }

    res.json({ message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markOrderPublished = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('listing', 'url');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.seller.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    order.status = 'published';
    const updatedOrder = await order.save();
    const buyer = await User.findById(order.buyer);

    await Notification.create({
      recipient: order.buyer,
      sender: req.user.id,
      type: 'order_update',
      message: `Your guest post on ${order.listing.url} is now published!`,
      link: `/orders/${order._id}`,
    });

    if (buyer && buyer.email) {
      try {
        await sendEmail({
          email: buyer.email,
          subject: `Your Guest Post is LIVE! - ${order.listing.url}`,
          html: `<h2 style="color: #10b981;">Great News!</h2><p>Your order for <strong>${order.listing.url}</strong> is live.</p>`
        });
      } catch (mailErr) { console.log("Email failed"); }
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const submitOrderContent = async (req, res) => {
  try {
    const { targetUrl, anchorText, articleLink, contentNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (order.buyer.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    order.targetUrl = targetUrl;
    order.anchorText = anchorText;
    
    if (articleLink) order.articleLink = articleLink;
    if (contentNotes) order.contentNotes = contentNotes;
    
    order.status = 'in_progress';
    await order.save();

    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deliverOrder = async (req, res) => {
  try {
    const { liveLink } = req.body;
    const order = await Order.findById(req.params.id);

    if (order.seller.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    order.liveLink = liveLink;
    order.status = 'published';
    await order.save();

    const seller = await User.findById(order.seller);
    seller.balance += order.price;
    await seller.save();

    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMySales,
  getOrderById,
  updateOrderContent,
  rejectOrder,
  markOrderPublished,
  submitOrderContent,
  deliverOrder
};