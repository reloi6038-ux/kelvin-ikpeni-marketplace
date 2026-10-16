/**
 * config/db.js
 * ------------
 * Establishes a single connection to MongoDB Atlas.
 * Also imports all Mongoose models on startup so that any
 * populate() call anywhere in the app can find them by name.
 *
 * Why importing ../models/index.js here matters:
 *   Without it, controllers that only import e.g. Product and Category
 *   would throw: "Schema hasn't been registered for model 'Seller'"
 *   when calling .populate('seller').
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// Register every Mongoose model exactly once at boot.
// This runs as a side effect and populates mongoose.models.
import '../models/index.js';

/**
 * connectDB
 * ---------
 * Connects to MongoDB Atlas. Call this once at server startup.
 *
 * Options used:
 *  - serverSelectionTimeoutMS: fail fast if Atlas is unreachable
 *  - socketTimeoutMS: close idle sockets after 45s (frees M0 resources)
 *  - maxPoolSize: M0 free tier caps connections; keep the pool small
 *  - autoIndex: only build indexes outside production
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not set in .env');
    throw new Error('MONGODB_URI missing');
  }

  // Prevent double-connect during nodemon hot reload
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB already connected');
    return mongoose.connection;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    logger.success(`MongoDB connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB error: ${err.message}`);
    });

    return conn.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

/**
 * disconnectDB
 * ------------
 * Cleanly closes the connection. Used in tests and graceful shutdown.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error(`Error closing MongoDB: ${error.message}`);
  }
};

export default connectDB;