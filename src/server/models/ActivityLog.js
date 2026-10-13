import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, 
  targetId: { type: String }, 
  details: { type: String }, 
  ipAddress: { type: String }
}, { timestamps: true });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);