import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true,
  },
  // SNAPSHOT: price and name frozen at time of purchase.
  // NEVER trust the current product document in an order.
  name: { type: String, required: true },
  sku: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  trackingNumber: String,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  commissionPercent: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  sellerEarning: { type: Number, required: true },
}, { _id: true, timestamps: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'Nigeria' },
    postalCode: String,
  },
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN' },
  couponCode: String,
  deliveryMethod: {
    type: String,
    enum: ['standard', 'express', 'pickup'],
    default: 'standard',
  },
  estimatedDelivery: Date,
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'unpaid',
    index: true,
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'flutterwave', 'cod', 'bank_transfer'],
    default: 'paystack',
  },
  paymentReference: String,
  paidAt: Date,
  customerNote: { type: String, maxlength: 500 },
  timeline: [{
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
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

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;