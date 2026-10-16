import { logger } from '../utils/logger.js';

/**
 * Global error handler — must be the LAST middleware in app.js.
 * Converts any thrown error into a consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details || null;

  // Mongoose: bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
    details = err.keyValue;
  }

  // Mongoose: validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log it (skip stack in prod for operational errors)
  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${message}`, err.stack);
  } else {
    logger.warn(`${statusCode} — ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    details,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};