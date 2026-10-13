import User from '../models/User';
import Order from '../models/Order';
import Listing from '../models/Listing';
import ActivityLog from '../models/ActivityLog';
import logActivity from '../logger';
import { json, readBody } from '../http';

export const getPlatformStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments({ isDeleted: { $ne: true } });
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({ status: 'published' });
    const totalRevenue = orders.reduce((acc, order) => acc + order.price, 0);

    const recentOrders = await Order.find()
      .populate('buyer', 'name')
      .populate('listing', 'url')
      .sort({ createdAt: -1 })
      .limit(5);

    return json({
      stats: {
        totalUsers,
        totalListings,
        totalOrders,
        totalRevenue,
      },
      recentOrders
    });
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return json(users);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const updateUserByAdmin = async (request, params, authUser) => {
  try {
    const { role, isSuspended } = await readBody(request);
    if (isSuspended === true && params.id === authUser.id) {
      return json({ message: "You can't suspend your own account." }, 400);
    }
    const user = await User.findById(params.id);

    if (user) {
      user.role = role || user.role;
      user.isSuspended = isSuspended !== undefined ? isSuspended : user.isSuspended;

      const updatedUser = await user.save();
      await logActivity(authUser.id, "USER_MODERATED", user._id, `Updated role to ${user.role} or suspended status.`);
      return json(updatedUser);
    } else {
      return json({ message: 'User not found' }, 404);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const toggleFeaturedListing = async (request, params, authUser) => {
  try {
    const listing = await Listing.findById(params.id);
    if (!listing || listing.isDeleted) return json({ message: 'Listing not found' }, 404);

    listing.isFeatured = !listing.isFeatured;
    if (listing.isFeatured) {
      listing.featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await listing.save();
    await logActivity(authUser.id, "LISTING_FEATURED", listing._id, `Set ${listing.url} featured: ${listing.isFeatured}`);
    return json(listing);
  } catch (error) { return json({ message: error.message }, 500); }
};

export const verifyListingMetrics = async (request, params, authUser) => {
  try {
    const listing = await Listing.findById(params.id);
    if (listing && !listing.isDeleted) {
      listing.isVerified = true;
      listing.lastVerifiedAt = Date.now();
      await listing.save();
      await logActivity(authUser.id, "METRICS_VERIFIED", listing._id, `Verified ${listing.url}`);
      return json(listing);
    } else { return json({ message: 'Listing not found' }, 404); }
  } catch (error) { return json({ message: error.message }, 500); }
};

export const getLogs = async () => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    return json(logs);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
