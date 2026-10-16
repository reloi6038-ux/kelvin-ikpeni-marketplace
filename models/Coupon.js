import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 4,
    maxlength: 20,
  },
  description: { type: String, maxlength: 200 },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Value cannot be negative'],
  },
  maxDiscount: { type: Number, min: 0 }, // cap for percentage coupons
  minOrderAmount: { type: Number, default: 0, min: 0 },
  appliesTo: {
    type: String,
    enum: ['all', 'category', 'product', 'seller'],
    default: 'all',
  },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  sellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }],
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  usedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date, default: Date.now },
  }],
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true, index: true },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

couponSchema.index({ isActive: 1, validUntil: 1 });

// Virtual: is expired?
couponSchema.virtual('isExpired').get(function isExpired() {
  return this.validUntil < new Date();
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;