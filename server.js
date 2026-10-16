import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB BEFORE starting the HTTP server.
    //    If the DB is down, we don't want to accept traffic.
    await connectDB();

    // 2. Start the HTTP server
    const server = app.listen(PORT, () => {
      logger.success('Kelvin Ikpeni Marketplace API running');
      logger.info(`Environment : ${NODE_ENV}`);
      logger.info(`URL         : http://${HOST}:${PORT}`);
      logger.info(`Health      : http://${HOST}:${PORT}/api/health`);
    });

    // 3. Graceful shutdown
    const shutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          const { disconnectDB } = await import('./config/db.js');
          await disconnectDB();
        } catch (err) {
          logger.error(`Shutdown error: ${err.message}`);
        }
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
    });

    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();