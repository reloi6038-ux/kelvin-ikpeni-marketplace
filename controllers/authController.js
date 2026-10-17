/**
 * controllers/authController.js
 * -----------------------------
 * Authentication endpoints:
 *  - POST /api/auth/register
 *  - POST /api/auth/login
 *  - POST /api/auth/logout
 *  - GET  /api/auth/me
 *  - PUT  /api/auth/profile
 *  - PUT  /api/auth/password
 *  - POST /api/auth/forgot-password
 *  - POST /api/auth/reset-password/:token
 *  - GET  /api/auth/verify-email/:token
 *  - POST /api/auth/resend-verification
 *
 * JWT is delivered in an httpOnly cookie (name: token) AND in the
 * response body (for API clients / tests).
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { logger } from '../utils/logger.js';

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_DAYS = Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7;

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const sendTokenResponse = (res, user, statusCode, message) => {
  const token = signToken(user);
  const cookieOptions = {
    expires: new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  };
  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
        },
        token, // also in body for API clients
      },
      message
    )
  );
};

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/register
   Body: { name, email, password, phone? }
   ═══════════════════════════════════════════════════════════ */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    throw ApiError.badRequest('Name, email, and password are required');
  }
  if (password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with that email already exists');

  // Generate email verification token
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim(),
    password,
    emailVerified: false,
    emailVerificationToken: verifyToken,
    emailVerificationExpires: verifyExpires,
  });

  // In Stage 10 we log the verification link. Stage 17 will email it.
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/pages/verify-email.html?token=${verifyToken}`;
  logger.info(`📧 [DEV] Verify email for ${user.email}: ${verifyUrl}`);

  // Auto-login after register
  sendTokenResponse(res, user, 201, 'Account created successfully. Please check your email to verify.');
});

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/login
   ═══════════════════════════════════════════════════════════ */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  // Must explicitly select password (it's `select: false` in the schema)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.isSuspended) throw ApiError.forbidden('Your account is suspended');
  if (!user.isActive) throw ApiError.forbidden('Your account is disabled');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(res, user, 200, 'Logged in successfully');
});

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/logout
   ═══════════════════════════════════════════════════════════ */
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/auth/me  (protected)
   ═══════════════════════════════════════════════════════════ */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  res.status(200).json(new ApiResponse(200, user, 'Current user fetched'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/auth/profile  (protected)
   Body: { name?, phone?, avatar?, addresses? }
   ═══════════════════════════════════════════════════════════ */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, addresses } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatar !== undefined) user.avatar = avatar;
  if (Array.isArray(addresses)) user.addresses = addresses;

  await user.save();
  res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/auth/password  (protected)
   Body: { currentPassword, newPassword }
   ═══════════════════════════════════════════════════════════ */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw ApiError.badRequest('Both passwords are required');
  if (newPassword.length < 8) throw ApiError.badRequest('New password must be at least 8 characters');

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.unauthorized('Current password is incorrect');

  user.password = newPassword;
  await user.save();

  sendTokenResponse(res, user, 200, 'Password changed successfully');
});

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/forgot-password
   Body: { email }
   ═══════════════════════════════════════════════════════════ */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('Email is required');

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Security: always return success even if user doesn't exist
  if (!user) {
    res.status(200).json(new ApiResponse(200, null, 'If an account exists, a reset link has been sent'));
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/pages/reset-password.html?token=${resetToken}`;
  logger.info(`📧 [DEV] Password reset for ${user.email}: ${resetUrl}`);

  res.status(200).json(new ApiResponse(200, null, 'If an account exists, a reset link has been sent'));
});

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/reset-password/:token
   Body: { password }
   ═══════════════════════════════════════════════════════════ */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(res, user, 200, 'Password reset successful. You are now logged in.');
});

/* ═══════════════════════════════════════════════════════════
   GET /api/auth/verify-email/:token
   ═══════════════════════════════════════════════════════════ */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw ApiError.badRequest('Invalid or expired verification token');

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, { emailVerified: true }, 'Email verified successfully'));
});

/* ═══════════════════════════════════════════════════════════
   POST /api/auth/resend-verification  (protected)
   ═══════════════════════════════════════════════════════════ */
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.emailVerified) throw ApiError.badRequest('Email is already verified');

  const verifyToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verifyToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/pages/verify-email.html?token=${verifyToken}`;
  logger.info(`📧 [DEV] Resent verification for ${user.email}: ${verifyUrl}`);

  res.status(200).json(new ApiResponse(200, null, 'Verification email sent'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/auth/orders  (protected)
   ═══════════════════════════════════════════════════════════ */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.status(200).json(new ApiResponse(200, { count: orders.length, orders }, 'Orders fetched'));
});

export default {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getMyOrders,
};