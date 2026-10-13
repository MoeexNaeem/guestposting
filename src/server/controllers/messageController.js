import Message from '../models/Message';
import Order from '../models/Order';
import Notification from '../models/Notification';
import User from '../models/User';
import sendEmail from '../sendEmail';
import { json, readBody } from '../http';

export const sendMessage = async (request, params, user) => {
  try {
    const { orderId, text } = await readBody(request);

    const message = await Message.create({
      order: orderId,
      sender: user.id,
      text,
    });

    const populatedMessage = await message.populate('sender', 'name role');
    const order = await Order.findById(orderId).populate('listing', 'url');

    if (!order) return json({ message: 'Order not found' }, 404);

    const recipientId = order.buyer.toString() === user.id ? order.seller : order.buyer;
    const recipient = await User.findById(recipientId);

    await Notification.create({
      recipient: recipientId,
      sender: user.id,
      type: 'message',
      message: `New message from ${user.name} regarding ${order.listing.url}`,
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
            <p>You have received a new message from <strong>${user.name}</strong> regarding your guest post order on <strong>${order.listing.url}</strong>.</p>
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

    return json(populatedMessage, 201);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getOrderMessages = async (request, params) => {
  try {
    const messages = await Message.find({ order: params.orderId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });
    return json(messages, 200);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
