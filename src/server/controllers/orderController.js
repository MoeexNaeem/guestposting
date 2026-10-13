import Order from '../models/Order';
import Listing from '../models/Listing';
import Notification from '../models/Notification';
import User from '../models/User';
import sendEmail from '../sendEmail';
import { json, readBody } from '../http';

export const createOrder = async (request, params, user) => {
  try {
    const { listingId } = await readBody(request);

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return json({ message: 'Listing not found' }, 404);
    }

    if (listing.seller.toString() === user.id) {
      return json({ message: 'You cannot buy your own listing' }, 400);
    }

    const listingSeller = await User.findById(listing.seller).select('isSuspended');
    if (!listingSeller || listingSeller.isSuspended) {
      return json({ message: 'This listing is currently unavailable.' }, 400);
    }

    const order = await Order.create({
      listing: listing._id,
      buyer: user.id,
      seller: listing.seller,
      price: listing.price,
      status: 'awaiting_content'
    });

    return json(order, 201);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getMyOrders = async (request, params, user) => {
  try {
    const orders = await Order.find({ buyer: user.id })
      .populate('listing', 'url category')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    return json(orders, 200);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getMySales = async (request, params, user) => {
  try {
    const orders = await Order.find({ seller: user.id })
      .populate('listing', 'url category')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    return json(orders, 200);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getOrderById = async (request, params, user) => {
  try {
    const order = await Order.findById(params.id)
      .populate('listing', 'url category price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!order) {
      return json({ message: 'Order not found' }, 404);
    }

    if (order.buyer._id.toString() !== user.id && order.seller._id.toString() !== user.id) {
      return json({ message: 'Not authorized to view this order' }, 401);
    }

    return json(order);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// PUT /api/orders/:id/content: the buyer submits the brief.
export const updateOrderContent = async (request, params, user) => {
  try {
    const { targetUrl, anchorText, articleLink, contentNotes } = await readBody(request);
    const order = await Order.findById(params.id);

    if (order) {
      if (order.buyer.toString() !== user.id) {
        return json({ message: 'Not authorized' }, 401);
      }

      // Once work has started (or the order is closed) the brief is locked;
      // re-opening a published order would let it be delivered and paid twice.
      if (order.status !== 'awaiting_content') {
        return json({ message: 'Requirements can only be submitted while the order is awaiting content.' }, 400);
      }

      order.targetUrl = targetUrl;
      order.anchorText = anchorText;
      if (articleLink) order.articleLink = articleLink;
      if (contentNotes) order.contentNotes = contentNotes;
      order.status = 'in_progress';

      const updatedOrder = await order.save();
      return json(updatedOrder);
    } else {
      return json({ message: 'Order not found' }, 404);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const rejectOrder = async (request, params, user) => {
  try {
    const order = await Order.findById(params.id).populate('listing', 'url');

    if (!order) return json({ message: 'Order not found' }, 404);

    // Only the seller can reject the order
    if (order.seller.toString() !== user.id) {
      return json({ message: 'Not authorized' }, 401);
    }

    if (!['awaiting_content', 'in_progress'].includes(order.status)) {
      return json({ message: 'Only open orders can be rejected.' }, 400);
    }

    order.status = 'cancelled';
    await order.save();

    // Notify Buyer
    await Notification.create({
      recipient: order.buyer,
      sender: user.id,
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

    return json({ message: 'Order cancelled' });
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

// PUT /api/orders/:id/publish: the seller delivers the live link and is paid.
export const markOrderPublished = async (request, params, user) => {
  try {
    const { liveLink } = (await readBody(request)) || {};
    const order = await Order.findById(params.id).populate('listing', 'url');
    if (!order) return json({ message: 'Order not found' }, 404);
    if (order.seller.toString() !== user.id) return json({ message: 'Not authorized' }, 401);
    if (!liveLink) return json({ message: 'Please provide the live URL of the published post.' }, 400);

    // Only an in-progress order can be published, and the status check is
    // part of the update itself so a double submit can't pay the seller twice.
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, status: 'in_progress' },
      { $set: { status: 'published', liveLink } },
      { new: true }
    ).populate('listing', 'url');
    if (!updatedOrder) {
      return json({ message: 'Only orders in progress can be marked as published.' }, 400);
    }

    await User.updateOne({ _id: order.seller }, { $inc: { balance: order.price } });

    const buyer = await User.findById(order.buyer);

    await Notification.create({
      recipient: order.buyer,
      sender: user.id,
      type: 'order_update',
      message: `Your guest post on ${order.listing.url} is now published!`,
      link: `/orders/${order._id}`,
    });

    if (buyer && buyer.email) {
      try {
        await sendEmail({
          email: buyer.email,
          subject: `Your Guest Post is LIVE! - ${order.listing.url}`,
          html: `<h2 style="color: #10b981;">Great News!</h2><p>Your order for <strong>${order.listing.url}</strong> is live.</p><p>Live link: ${escapeHtml(liveLink)}</p>`
        });
      } catch (mailErr) { console.log("Email failed"); }
    }
    return json(updatedOrder);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
