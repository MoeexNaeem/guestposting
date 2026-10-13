import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Open order chats poll this query every few seconds.
messageSchema.index({ order: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema);