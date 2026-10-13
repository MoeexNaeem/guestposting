import Notification from '../models/Notification';
import { json } from '../http';

export const getNotifications = async (request, params, user) => {
  try {
    const notifications = await Notification.find({ recipient: user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    return json(notifications, 200);
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const markAsRead = async (request, params, user) => {
  try {
    const notification = await Notification.findById(params.id);
    if (notification) {
      if (notification.recipient.toString() !== user.id) {
        return json({ message: 'Not authorized' }, 401);
      }
      notification.isRead = true;
      await notification.save();
      return json({ message: 'Marked as read' });
    } else {
      return json({ message: 'Notification not found' }, 404);
    }
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};

export const markAllRead = async (request, params, user) => {
  try {
    await Notification.updateMany(
      { recipient: user.id, isRead: false },
      { $set: { isRead: true } }
    );
    return json({ message: 'All notifications marked as read' });
  } catch (error) {
    return json({ message: error.message }, 500);
  }
};
