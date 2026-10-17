/**
 * controllers/sellerController.js
 * -------------------------------
 * Handles seller registration, storefronts, and seller dashboards.
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Seller from '../models/Seller.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

/* ═══════════════════════════════════════════════════════════
   POST /api/sellers/register
   ═══════════════════════════════════════════════════════════ */
export const registerSeller = asyncHandler(async (req, res) => {
  const { storeName, description, businessEmail, businessPhone } = req.body;
  
  if (!storeName) throw ApiError.badRequest('Store name is required');

  // Check if user already has a store
  const existing = await Seller.findOne({ user: req.user._id });
  if (existing) throw ApiError.badRequest('You already have a store application');

  const seller = await Seller.create({
    user: req.user._id,
    storeName,
    description,
    businessEmail,
    businessPhone,
    status: 'pending', // Requires admin approval
  });

  // Update user role
  await User.findByIdAndUpdate(req.user._id, { role: 'seller' });

  res.status(201).json(new ApiResponse(201, seller, 'Seller application submitted for review'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/sellers/dashboard
   ═══════════════════════════════════════════════════════════ */
export const getSellerDashboard = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) throw ApiError.forbidden('You do not have a seller account');
  if (seller.status !== 'approved') throw ApiError.forbidden('Your seller account is pending approval');

  // Aggregations for dashboard stats
  const productCount = await Product.countDocuments({ seller: seller._id });
  
  // Recent orders containing items from this seller
  const recentOrders = await Order.find({ 'items.seller': seller._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.status(200).json(new ApiResponse(200, {
    seller,
    stats: {
      ...seller.stats,
      totalProducts: productCount,
    },
    recentOrders,
  }, 'Dashboard data fetched'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/sellers/my-products
   ═══════════════════════════════════════════════════════════ */
export const getSellerProducts = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) throw ApiError.forbidden('Seller account required');

  const products = await Product.find({ seller: seller._id }).sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, { products }, 'Products fetched'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/sellers/orders
   ═══════════════════════════════════════════════════════════ */
export const getSellerOrders = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) throw ApiError.forbidden('Seller account required');

  // Find orders that have items belonging to this seller
  const orders = await Order.find({ 'items.seller': seller._id })
    .sort({ createdAt: -1 })
    .lean();

  // Filter items to only show this seller's portion
  const sellerOrders = orders.map(order => {
    const myItems = order.items.filter(item => item.seller.toString() === seller._id.toString());
    const mySubtotal = myItems.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      ...order,
      items: myItems,
      sellerSubtotal: mySubtotal,
    };
  });

  res.status(200).json(new ApiResponse(200, { orders: sellerOrders }, 'Orders fetched'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/sellers/orders/:orderNumber/fulfill
   ═══════════════════════════════════════════════════════════ */
export const fulfillOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const { trackingNumber } = req.body;
  const seller = await Seller.findOne({ user: req.user._id });
  
  if (!seller) throw ApiError.forbidden('Seller account required');

  const order = await Order.findOne({ orderNumber });
  if (!order) throw ApiError.notFound('Order not found');

  let updated = false;
  order.items.forEach(item => {
    if (item.seller.toString() === seller._id.toString() && item.status === 'processing') {
      item.status = 'shipped';
      item.trackingNumber = trackingNumber;
      item.shippedAt = new Date();
      updated = true;
    }
  });

  if (!updated) throw ApiError.badRequest('No processing items found for this seller in this order');

  // If all items shipped, update order status
  if (order.items.every(item => ['shipped', 'delivered'].includes(item.status))) {
    order.status = 'shipped';
  }

  order.timeline.push({ status: 'shipped', note: `Items shipped by ${seller.storeName}`, at: new Date() });
  await order.save();

  res.status(200).json(new ApiResponse(200, order, 'Order fulfilled'));
});

export default {
  registerSeller,
  getSellerDashboard,
  getSellerProducts,
  getSellerOrders,
  fulfillOrder,
};