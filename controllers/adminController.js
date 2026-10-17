/**
 * controllers/adminController.js
 * ------------------------------
 * Admin dashboard and moderation endpoints.
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/* ═══════════════════════════════════════════════════════════
   GET /api/admin/dashboard
   ═══════════════════════════════════════════════════════════ */
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [userCount, sellerCount, productCount, orderCount, recentOrders] = await Promise.all([
    User.countDocuments(),
    Seller.countDocuments({ status: 'approved' }),
    Product.countDocuments({ status: 'active' }),
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email').lean(),
  ]);

  // Calculate total revenue from paid orders
  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  res.status(200).json(new ApiResponse(200, {
    stats: { userCount, sellerCount, productCount, orderCount, totalRevenue },
    recentOrders,
  }, 'Admin dashboard fetched'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/admin/sellers/pending
   ═══════════════════════════════════════════════════════════ */
export const getPendingSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find({ status: 'pending' }).populate('user', 'name email phone').lean();
  res.status(200).json(new ApiResponse(200, { sellers }, 'Pending sellers fetched'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/admin/sellers/:id/approve
   ═══════════════════════════════════════════════════════════ */
export const approveSeller = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw ApiError.notFound('Seller not found');

  seller.status = 'approved';
  seller.approvedAt = new Date();
  seller.approvedBy = req.user._id;
  await seller.save();

  res.status(200).json(new ApiResponse(200, seller, 'Seller approved'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/admin/products/pending
   ═══════════════════════════════════════════════════════════ */
export const getPendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'pending' }).populate('seller', 'storeName').lean();
  res.status(200).json(new ApiResponse(200, { products }, 'Pending products fetched'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/admin/products/:id/approve
   ═══════════════════════════════════════════════════════════ */
export const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  product.status = 'active';
  await product.save();

  res.status(200).json(new ApiResponse(200, product, 'Product approved'));
});

export default {
  getAdminDashboard,
  getPendingSellers,
  approveSeller,
  getPendingProducts,
  approveProduct,
};