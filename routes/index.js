/**
 * routes/index.js
 * ---------------
 * Aggregates all API route groups and mounts them under /api.
 * Applies specific rate limiters to sensitive routes.
 */

import express from 'express';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import adminRoutes from './adminRoutes.js';
import { authLimiter, paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ─── Public Routes ───
// Auth routes get strict rate limiting to prevent brute-force attacks
router.use('/auth', authLimiter, authRoutes);

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);

// ─── Protected Routes ───
// Cart, Wishlist, and Orders require auth (handled inside their own routers)
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);

// Payments get their own specific rate limiter
router.use('/payments', paymentLimiter, paymentRoutes);

// Seller & Admin dashboards
router.use('/sellers', sellerRoutes);
router.use('/admin', adminRoutes);

export default router;