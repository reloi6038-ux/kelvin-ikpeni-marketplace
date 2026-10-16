import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'order_placed', 'order_shipped', 'order_delivered', 'order_cancelled',
      'payment_success', 'payment_failed',
      'product_approved', 'product_rejected',
      'seller_approved', 'seller_rejected',
      'review_reply', 'payout_processed',
      'promotion', 'system',
    ],
    required: true,
  },
  title: { type: String, required: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 500 },
  link: String,
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;