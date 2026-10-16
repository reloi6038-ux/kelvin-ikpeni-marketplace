import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: { type: String, maxlength: 120 },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
  },
  images: {
    type: [String],
    validate: {
      validator: (v) => v.length <= 5,
      message: 'Maximum 5 images per review',
    },
  },
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true, index: true },
  isReported: { type: Boolean, default: false },
  reportReason: String,
  helpfulCount: { type: Number, default: 0 },
  helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sellerResponse: {
    text: String,
    respondedAt: Date,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
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

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;