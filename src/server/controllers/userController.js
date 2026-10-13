import User from '../models/User';
import Order from '../models/Order';
import Listing from '../models/Listing';
import Review from '../models/Review';
import { json } from '../http';

export const getUserProfile = async (request, params, authUser) => {
  try {
    const user = await User.findById(authUser.id).select('-password');

    const orders = await Order.find({
      $or: [{ buyer: authUser.id }, { seller: authUser.id }]
    });

    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'published').length,
      totalVolume: orders
        .filter(o => o.status === 'published')
        .reduce((acc, curr) => acc + curr.price, 0)
    };

    return json({ user, stats });
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getPublicSellerProfile = async (request, params) => {
  try {
    const seller = await User.findById(params.id).select('name createdAt role');
    if (!seller || seller.role !== 'seller') {
      return json({ message: 'Seller not found' }, 404);
    }

    const listings = await Listing.find({ seller: params.id, status: 'approved' });

    const reviews = await Review.find({ seller: params.id }).populate('buyer', 'name');

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1)
      : 0;

    return json({ seller, listings, reviews, avgRating });
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
