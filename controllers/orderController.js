/**
 * controllers/orderController.js
 * ------------------------------
 * Checkout, order creation, order tracking.
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Seller from '../models/Seller.js';
import Coupon from '../models/Coupon.js';

const DELIVERY_FEE = Number(process.env.DEFAULT_DELIVERY_FEE) || 2500;
const FREE_THRESHOLD = Number(process.env.FREE_DELIVERY_THRESHOLD) || 50000;

/* ═══════════════════════════════════════════════════════════
   POST /api/orders — create an order from cart
   ═══════════════════════════════════════════════════════════ */
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, deliveryMethod = 'standard', customerNote } = req.body;

  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state) {
    throw ApiError.badRequest('Complete shipping address required');
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || !cart.items.length) throw ApiError.badRequest('Cart is empty');

  // Validate stock and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || product.status !== 'active') {
      throw ApiError.badRequest(`Product "${item.product.name}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Only ${product.stock} of "${product.name}" left in stock`);
    }

    const seller = await Seller.findById(product.seller);
    const commissionPercent = seller?.commissionPercent || 10;
    const itemTotal = product.price * item.quantity;
    const commissionAmount = Math.round((itemTotal * commissionPercent) / 100);
    const sellerEarning = itemTotal - commissionAmount;

    orderItems.push({
      product: product._id,
      seller: product.seller,
      name: product.name,
      sku: product.sku,
      image: product.thumbnail || product.images?.[0] || '/images/placeholders/product.svg',
      price: product.price,
      quantity: item.quantity,
      subtotal: itemTotal,
      commissionPercent,
      commissionAmount,
      sellerEarning,
      status: 'pending',
    });

    subtotal += itemTotal;
  }

  // Coupon discount
  let discount = 0;
  let couponCode = null;
  if (cart.couponCode) {
    const coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true, validUntil: { $gt: new Date() } });
    if (coupon && subtotal >= (coupon.minOrderAmount || 0)) {
      if (coupon.type === 'percentage') {
        discount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
      couponCode = coupon.code;
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      coupon.usedBy = coupon.usedBy || [];
      coupon.usedBy.push({ user: req.user._id, usedAt: new Date() });
      await coupon.save();
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const deliveryFee = afterDiscount >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = afterDiscount + deliveryFee;

  const orderNumber = `KIM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

  const order = await Order.create({
    orderNumber,
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    discount,
    deliveryFee,
    tax: 0,
    total,
    currency: 'NGN',
    couponCode,
    deliveryMethod,
    estimatedDelivery,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'paystack',
    customerNote,
    timeline: [{ status: 'pending', note: 'Order created', at: new Date(), by: req.user._id }],
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.quantity, sold: item.quantity } }
    );
  }

  // Clear cart
  cart.items = [];
  cart.couponCode = null;
  await cart.save();

  res.status(201).json(new ApiResponse(201, order, 'Order created'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/orders/my
   ═══════════════════════════════════════════════════════════ */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
  res.status(200).json(new ApiResponse(200, { count: orders.length, orders }, 'Orders fetched'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/orders/:orderNumber
   ═══════════════════════════════════════════════════════════ */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this order');
  }
  res.status(200).json(new ApiResponse(200, order, 'Order fetched'));
});

export default { createOrder, getMyOrders, getOrder };