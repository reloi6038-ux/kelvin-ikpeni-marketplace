/**
 * controllers/cartController.js
 * -----------------------------
 * Cart endpoints (all require auth):
 *  - GET    /api/cart
 *  - POST   /api/cart/add           { productId, quantity }
 *  - PUT    /api/cart/update/:productId  { quantity }
 *  - DELETE /api/cart/remove/:productId
 *  - DELETE /api/cart/clear
 *  - POST   /api/cart/coupon        { code }
 *  - DELETE /api/cart/coupon
 *
 * Returns cart with computed subtotal, discount, delivery, total.
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

const DELIVERY_FEE = Number(process.env.DEFAULT_DELIVERY_FEE) || 2500;
const FREE_THRESHOLD = Number(process.env.FREE_DELIVERY_THRESHOLD) || 50000;

/* ═══════════════════════════════════════════════════════════
   Helper — build the cart response with computed totals.
   ═══════════════════════════════════════════════════════════ */
const buildCartResponse = async (cart) => {
  if (!cart) return { items: [], subtotal: 0, discount: 0, deliveryFee: 0, total: 0, itemCount: 0 };

  // Populate product details on each item
  const items = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.product).select('name slug thumbnail images price previousPrice stock brand seller').lean();
      if (!product) return null; // product deleted
      return {
        productId: item.product,
        seller: item.seller,
        quantity: item.quantity,
        price: product.price,
        previousPrice: product.previousPrice,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        image: product.thumbnail || product.images?.[0] || '/images/placeholders/product.svg',
        stock: product.stock,
        lineTotal: product.price * item.quantity,
      };
    })
  );
  const validItems = items.filter(Boolean);

  const subtotal = validItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const itemCount = validItems.reduce((sum, i) => sum + i.quantity, 0);

  // Coupon discount
  let discount = 0;
  let couponInfo = null;
  if (cart.couponCode && subtotal > 0) {
    const coupon = await Coupon.findOne({
      code: cart.couponCode,
      isActive: true,
      validUntil: { $gt: new Date() },
    });
    if (coupon) {
      const minOrder = coupon.minOrderAmount || 0;
      if (subtotal >= minOrder) {
        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * coupon.value) / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = Math.min(coupon.value, subtotal);
        }
        couponInfo = { code: coupon.code, description: coupon.description, discount };
      }
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const deliveryFee = subtotal === 0 ? 0 : (afterDiscount >= FREE_THRESHOLD ? 0 : DELIVERY_FEE);
  const total = afterDiscount + deliveryFee;

  return {
    items: validItems,
    subtotal,
    discount,
    couponCode: cart.couponCode || null,
    coupon: couponInfo,
    deliveryFee,
    total,
    itemCount,
  };
};

/* ═══════════════════════════════════════════════════════════
   GET /api/cart
   ═══════════════════════════════════════════════════════════ */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  const response = await buildCartResponse(cart);
  res.status(200).json(new ApiResponse(200, response, 'Cart fetched'));
});

/* ═══════════════════════════════════════════════════════════
   POST /api/cart/add
   Body: { productId, quantity }
   ═══════════════════════════════════════════════════════════ */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw ApiError.badRequest('productId is required');

  const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (product.status !== 'active') throw ApiError.badRequest('Product is not available');
  if (product.stock < qty) throw ApiError.badRequest(`Only ${product.stock} in stock`);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) {
    const newQty = Math.min(99, existing.quantity + qty);
    if (product.stock < newQty) throw ApiError.badRequest(`Only ${product.stock} in stock`);
    existing.quantity = newQty;
    existing.priceAtAdd = product.price;
  } else {
    cart.items.push({
      product: product._id,
      seller: product.seller,
      quantity: qty,
      priceAtAdd: product.price,
    });
  }

  cart.lastActivityAt = new Date();
  await cart.save();

  const response = await buildCartResponse(cart);
  res.status(200).json(new ApiResponse(200, response, 'Added to cart'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/cart/update/:productId
   Body: { quantity }
   ═══════════════════════════════════════════════════════════ */
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const qty = Number(quantity);
  if (!qty || qty < 1) throw ApiError.badRequest('Quantity must be at least 1');

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw ApiError.notFound('Item not in cart');

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (product.stock < qty) throw ApiError.badRequest(`Only ${product.stock} in stock`);

  item.quantity = Math.min(99, qty);
  cart.lastActivityAt = new Date();
  await cart.save();

  const response = await buildCartResponse(cart);
  res.status(200).json(new ApiResponse(200, response, 'Cart updated'));
});

/* ═══════════════════════════════════════════════════════════
   DELETE /api/cart/remove/:productId
   ═══════════════════════════════════════════════════════════ */
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  const response = await buildCartResponse(cart);
  res.status(200).json(new ApiResponse(200, response, 'Item removed'));
});

/* ═══════════════════════════════════════════════════════════
   DELETE /api/cart/clear
   ═══════════════════════════════════════════════════════════ */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = null;
    await cart.save();
  }
  res.status(200).json(new ApiResponse(200, { items: [], subtotal: 0, discount: 0, deliveryFee: 0, total: 0, itemCount: 0 }, 'Cart cleared'));
});

/* ═══════════════════════════════════════════════════════════
   POST /api/cart/coupon
   Body: { code }
   ═══════════════════════════════════════════════════════════ */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw ApiError.badRequest('Coupon code required');

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    validUntil: { $gt: new Date() },
  });
  if (!coupon) throw ApiError.notFound('Invalid or expired coupon');

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  cart.couponCode = coupon.code;
  await cart.save();

  const response = await buildCartResponse(cart);
  if (!response.coupon) {
    // Coupon exists but minimum not met — clear it
    cart.couponCode = null;
    await cart.save();
    throw ApiError.badRequest(
      `Coupon requires a minimum order of ₦${(coupon.minOrderAmount || 0).toLocaleString()}`
    );
  }
  res.status(200).json(new ApiResponse(200, response, 'Coupon applied'));
});

/* ═══════════════════════════════════════════════════════════
   DELETE /api/cart/coupon
   ═══════════════════════════════════════════════════════════ */
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.couponCode = null;
    await cart.save();
  }
  const response = await buildCartResponse(cart);
  res.status(200).json(new ApiResponse(200, response, 'Coupon removed'));
});

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
};