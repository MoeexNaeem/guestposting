import Review from '../models/Review';
import Order from '../models/Order';
import { json, readBody } from '../http';

export const createReview = async (request, params, user) => {
  try {
    const { orderId, rating, comment } = await readBody(request);

    const order = await Order.findById(orderId);

    if (!order) return json({ message: 'Order not found' }, 404);

    if (order.status !== 'published') {
      return json({ message: 'You can only review completed orders' }, 400);
    }

    if (order.buyer.toString() !== user.id) {
      return json({ message: 'Only the buyer can leave a review' }, 401);
    }

    const review = await Review.create({
      order: orderId,
      buyer: user.id,
      seller: order.seller,
      rating,
      comment,
    });

    return json(review, 201);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getSellerReviews = async (request, params) => {
  try {
    const reviews = await Review.find({ seller: params.id })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    return json(reviews);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
