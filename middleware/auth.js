/**
 * middleware/auth.js
 * ------------------
 * JWT authentication + role authorization.
 *
 *   requireAuth          — verifies token from cookie OR Authorization header
 *   requireRole('admin') — must come AFTER requireAuth
 *   requireVerified      — must have verified email
 */

import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Extract token from httpOnly cookie or Authorization: Bearer <token>.
 */
const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
};

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.isSuspended) throw ApiError.forbidden('Account suspended');
  if (!user.isActive) throw ApiError.forbidden('Account disabled');

  req.user = user;
  next();
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required role: ${roles.join(' or ')}`));
    }
    next();
  };
};

export const requireVerified = (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Authentication required'));
  if (!req.user.emailVerified) {
    return next(ApiError.forbidden('Please verify your email to continue'));
  }
  next();
};

/**
 * Attach user if a valid token is present, without failing otherwise.
 * Useful for endpoints that behave differently for logged-in users
 * (e.g., reviews list showing "your review" highlight).
 */
export const attachUser = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (user && !user.isSuspended) req.user = user;
  } catch {
    // Invalid token — treat as guest
  }
  next();
});