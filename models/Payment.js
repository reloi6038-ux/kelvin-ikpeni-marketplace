import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['paystack', 'flutterwave'],
    required: true,
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN' },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'abandoned', 'reversed'],
    default: 'pending',
    index: true,
  },
  channel: String, // card, bank, ussd, etc.
  providerResponse: { type: mongoose.Schema.Types.Mixed },
  verifiedAt: Date,
  failureReason: String,
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

paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;