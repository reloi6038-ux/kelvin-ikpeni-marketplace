/**
 * controllers/reviewController.js
 * -------------------------------
 * Public review endpoints:
 *  - GET  /api/reviews/product/:productId     → list reviews for a product
 *  - POST /api/reviews                        → create a review (auth required)
 *  - GET  /api/reviews/product/:productId/stats → rating breakdown
 */

import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/**
 * Recalculate and persist a product's rating.average and rating.count
 * after a review is added or removed.
 */
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
        r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  const s = stats[0] || { avg: 0, count: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        'rating.average': Math.round((s.avg || 0) * 10) / 10,
        'rating.count': s.count || 0,
        'rating.distribution.1': s.r1,
        'rating.distribution.2': s.r2,
        'rating.distribution.3': s.r3,
        'rating.distribution.4': s.r4,
        'rating.distribution.5': s.r5,
      },
    }
  );
};

/**
 * GET /api/reviews/product/:productId
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const sort = req.query.sort || 'recent';

  const sortMap = {
    recent: { createdAt: -1 },
    helpful: { helpfulCount: -1, createdAt: -1 },
    'rating-desc': { rating: -1, createdAt: -1 },
    'rating-asc': { rating: 1, createdAt: -1 },
  };

  const filter = { product: productId, isApproved: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sortMap[sort] || sortMap.recent)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar initials')
      .lean(),
    Review.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
      'Reviews fetched'
    )
  );
});

/**
 * GET /api/reviews/product/:productId/stats
 */
export const getReviewStats = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const objId = new mongoose.Types.ObjectId(productId);

  const stats = await Review.aggregate([
    { $match: { product: objId, isApproved: true } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
        r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  const s = stats[0] || { avg: 0, count: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        average: Math.round((s.avg || 0) * 10) / 10,
        count: s.count || 0,
        distribution: {
          1: s.r1,
          2: s.r2,
          3: s.r3,
          4: s.r4,
          5: s.r5,
        },
      },
      'Review stats fetched'
    )
  );
});

/**
 * POST /api/reviews
 */
export const createReview = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('You must be logged in to review');

  const { productId, rating, title, comment } = req.body;
  if (!productId || !rating || !comment) {
    throw ApiError.badRequest('productId, rating, and comment are required');
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    throw ApiError.badRequest('Rating must be between 1 and 5');
  }

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  const purchase = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: { $in: ['paid', 'delivered', 'shipped'] },
  }).select('_id');

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: Number(rating),
    title: title?.trim()?.slice(0, 120),
    comment: comment.trim().slice(0, 2000),
    isVerifiedPurchase: !!purchase,
    order: purchase?._id,
    isApproved: true,
  });

  await recalcProductRating(product._id);
  const populated = await review.populate('user', 'name avatar initials');

  res.status(201).json(new ApiResponse(201, populated, 'Review created'));
});

export default {
  getProductReviews,
  getReviewStats,
  createReview,
};