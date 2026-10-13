import ActivityLog from './models/ActivityLog';

const logActivity = async (userId, action, targetId = null, details = "") => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      targetId,
      details
    });
  } catch (err) {
    console.error("Logging failed:", err);
  }
};

export default logActivity;
