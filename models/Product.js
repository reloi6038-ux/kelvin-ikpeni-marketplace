import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
  sku: {
    type: String,
    unique: true,
    uppercase: true,
    required: [true, 'SKU is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  shortDescription: { type: String, maxlength: 300 },
  brand: { type: String, required: true, trim: true, index: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  previousPrice: {
    type: Number,
    min: [0, 'Previous price cannot be negative'],
  },
  discountPercent: { type: Number, default: 0, min: 0, max: 90 },
  currency: { type: String, default: 'NGN', enum: ['NGN', 'USD', 'GBP', 'EUR'] },
  images: {
    type: [String],
    validate: {
      validator: (v) => v.length <= 8,
      message: 'Maximum 8 images per product',
    },
  },
  thumbnail: { type: String, default: '' },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  lowStockThreshold: { type: Number, default: 5 },
  weight: { type: Number, min: 0 },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' },
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  sold: { type: Number, default: 0, min: 0 },
  views: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'rejected', 'archived'],
    default: 'pending',
    index: true,
  },
  rejectionReason: String,
  isFeatured: { type: Boolean, default: false, index: true },
  isFlashSale: { type: Boolean, default: false, index: true },
  flashSaleEndsAt: Date,
  freeShipping: { type: Boolean, default: false },
  shippingFee: { type: Number, default: 0, min: 0 },
  metaTitle: String,
  metaDescription: String,
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

// Compound indexes for common queries
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ 'rating.average': -1, status: 1 });
productSchema.index({ price: 1, status: 1 });
productSchema.index({ sold: -1, status: 1 });

// Full-text search index
productSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text',
});

// Auto-generate slug
productSchema.pre('save', function generateSlug(next) {
  if (this.isModified('name')) {
    const base = slugify(this.name, { lower: true, strict: true });
    this.slug = `${base}-${this.sku.toLowerCase().slice(-6)}`;
  }
  next();
});

// Auto-calculate discount percent
productSchema.pre('save', function calcDiscount(next) {
  if (this.previousPrice && this.previousPrice > this.price) {
    this.discountPercent = Math.round(
      ((this.previousPrice - this.price) / this.previousPrice) * 100
    );
  }
  next();
});

// Virtual: in stock?
productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

const Product = mongoose.model('Product', productSchema);

export default Product;