import rateLimit from 'express-rate-limit';

/**
 * General API limiter — protects every endpoint from abuse.
 * 500 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please slow down and try again later.',
  },
});

/**
 * Strict limiter for auth endpoints — blocks brute-force attacks.
 * 10 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many auth attempts. Try again in 15 minutes.',
  },
});

/**
 * Payment limiter — prevents rapid-fire checkout attempts.
 * 20 attempts per hour per IP.
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many payment attempts. Please try again later.',
  },
});