import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * connectDB
 * ---------
 * Establishes a single connection to MongoDB Atlas.
 * Call this once at server startup.
 *
 * Why options matter:
 *  - serverSelectionTimeoutMS: fail fast if Atlas is unreachable
 *  - socketTimeoutMS: kill idle sockets after 45s to free resources on M0
 *  - maxPoolSize: M0 free tier caps connections; keep the pool small
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not set in .env');
    throw new Error('MONGODB_URI missing');
  }

  // Prevent double-connections during nodemon hot-reload
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
      autoIndex: process.env.NODE_ENV !== 'production', // don't build indexes on every boot in prod
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