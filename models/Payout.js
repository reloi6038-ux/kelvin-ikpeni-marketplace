import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true,
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  method: {
    type: String,
    enum: ['bank_transfer', 'paystack', 'flutterwave'],
    default: 'bank_transfer',
  },
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String,
  },
  reference: { type: String, unique: true, sparse: true },
  periodStart: Date,
  periodEnd: Date,
  ordersIncluded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  notes: String,
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

payoutSchema.index({ createdAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;