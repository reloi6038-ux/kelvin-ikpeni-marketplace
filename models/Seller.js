import mongoose from 'mongoose';
import slugify from 'slugify';

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    unique: true,
    minlength: [3, 'Store name must be at least 3 characters'],
    maxlength: [60, 'Store name cannot exceed 60 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '',
  },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  businessEmail: { type: String, lowercase: true, trim: true },
  businessPhone: { type: String, trim: true },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'Nigeria' },
  },
  cacNumber: String, // Nigerian business registration number
  tin: String, // Tax Identification Number
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  rejectionReason: String,
  commissionPercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 50,
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
  },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
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

sellerSchema.index({ status: 1 });
sellerSchema.index({ 'rating.average': -1 });
sellerSchema.index({ createdAt: -1 });

// Auto-generate slug from storeName
sellerSchema.pre('save', function generateSlug(next) {
  if (this.isModified('storeName')) {
    this.slug = slugify(this.storeName, { lower: true, strict: true });
  }
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;