import rateLimit from 'express-rate-limit';

/**
 * General API limiter — protects every endpoint from abuse.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
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