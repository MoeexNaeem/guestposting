const Message = require('../models/Message');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const User = require('../models/User'); 
const sendEmail = require('../utils/sendEmail');

const sendMessage = async (req, res) => {
  try {
    const { orderId, text } = req.body;

    const message = await Message.create({
      order: orderId,
      sender: req.user.id,
      text,
    });

    const populatedMessage = await message.populate('sender', 'name role');
    const order = await Order.findById(orderId).populate('listing', 'url');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const recipientId = order.buyer.toString() === req.user.id ? order.seller : order.buyer;
    const recipient = await User.findById(recipientId);

    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: 'message',
      message: `New message from ${req.user.name} regarding ${order.listing.url}`,
      link: `/orders/${orderId}`,
      isRead: false
    });

    try {
      await sendEmail({
        email: recipient.email,
        subject: `New Message on LetRank: ${order.listing.url}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">New Message Received</h2>
            <p>Hi <strong>${recipient.name}</strong>,</p>
            <p>You have received a new message from <strong>${req.user.name}</strong> regarding your guest post order on <strong>${order.listing.url}</strong>.</p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #2563eb;">
              "${text}"
            </blockquote>
            <a href="${process.env.FRONTEND_URL}/orders/${orderId}" 
               style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
               Reply on LetRank
            </a>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email failed to send, but message was saved.");
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderMessages = async (req, res) => {
  try {
    const messages = await Message.find({ order: req.params.orderId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getOrderMessages };