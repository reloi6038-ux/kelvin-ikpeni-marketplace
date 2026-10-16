import 'dotenv/config';
import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Stage 3 will add:
    // import connectDB from './config/db.js';
    // await connectDB();

    const server = app.listen(PORT, () => {
      logger.success(`Kelvin Ikpeni Marketplace API running`);
      logger.info(`Environment : ${NODE_ENV}`);
      logger.info(`URL         : http://${HOST}:${PORT}`);
      logger.info(`Health      : http://${HOST}:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
    });

    // Uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();