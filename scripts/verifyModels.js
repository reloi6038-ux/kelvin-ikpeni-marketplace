import 'dotenv/config';
import connectDB, { disconnectDB } from '../config/db.js';
import * as models from '../models/index.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  try {
    await connectDB();

    const names = Object.keys(models);
    logger.info(`Loaded ${names.length} models:`);
    names.forEach((name) => {
      const m = models[name];
      const count = m.schema ? Object.keys(m.schema.paths).length : 0;
      logger.info(`  → ${name} (${count} fields)`);
    });

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error(`Verification failed: ${error.message}`);
    process.exit(1);
  }
};

run();