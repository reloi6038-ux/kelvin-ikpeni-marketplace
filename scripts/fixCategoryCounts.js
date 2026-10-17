/**
 * scripts/fixCategoryCounts.js
 * ----------------------------
 * Counts products per category (including subcategories) and updates
 * the `productCount` field on each category document.
 *
 * Run once: node scripts/fixCategoryCounts.js
 *
 * Why: The initial seed script only incremented productCount on the
 * leaf subcategory. Parent categories (like "Electronics") stayed at 0.
 * This script walks every category, counts its own products + all
 * descendant products, and stores the correct total.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const run = async () => {
  try {
    await connectDB();
    logger.info(`Database: ${mongoose.connection.name}`);

    const categories = await Category.find({});
    logger.info(`Found ${categories.length} categories`);

    let updated = 0;

    for (const cat of categories) {
      // Count products directly in this category
      let count = await Product.countDocuments({
        category: cat._id,
        status: 'active',
      });

      // If it's a parent, also count products in its children
      const children = await Category.find({ parent: cat._id }).select('_id');
      if (children.length > 0) {
        const childIds = children.map((c) => c._id);
        const childCount = await Product.countDocuments({
          category: { $in: childIds },
          status: 'active',
        });
        count += childCount;
      }

      if (cat.productCount !== count) {
        cat.productCount = count;
        await cat.save();
        logger.info(`  ${cat.name} → ${count} products`);
        updated++;
      } else {
        logger.info(`  ${cat.name} → ${count} products (unchanged)`);
      }
    }

    logger.success(`Updated ${updated} of ${categories.length} categories`);

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    logger.error(`Failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
};

run();