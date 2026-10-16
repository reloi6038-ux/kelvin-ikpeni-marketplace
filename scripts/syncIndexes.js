import 'dotenv/config';
import connectDB, { disconnectDB } from '../config/db.js';
import * as models from '../models/index.js';
import { logger } from '../utils/logger.js';

const sync = async () => {
  await connectDB();
  for (const [name, Model] of Object.entries(models)) {
    try {
      await Model.syncIndexes();
      logger.success(`${name}: indexes synced`);
    } catch (err) {
      logger.error(`${name}: ${err.message}`);
    }
  }
  await disconnectDB();
  process.exit(0);
};

sync();