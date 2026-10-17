/**
 * scripts/seed.js
 * ---------------
 * Idempotent seed script. Safe to run multiple times.
 *
 * Usage:
 *   node scripts/seed.js            # add missing records, keep existing
 *   node scripts/seed.js --fresh    # WIPE all data, then seed
 *   node scripts/seed.js --products # only seed products
 *
 * After seeding, category product counts are synced so the
 * homepage tiles show accurate numbers.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { CATEGORIES } from '../config/constants.js';
import { DEMO_USERS, DEMO_PRODUCTS, DEMO_COUPONS } from './seedData.js';

import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';

const args = process.argv.slice(2);
const FRESH = args.includes('--fresh');
const PRODUCTS_ONLY = args.includes('--products');

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const skuFrom = (name, index) => {
  const prefix = name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w.slice(0, 3).toUpperCase())
    .join('');
  return `KIM-${prefix}-${String(index).padStart(5, '0')}`;
};

// ─────────────────────────────────────────────────────────────
// Clean (only with --fresh)
// ─────────────────────────────────────────────────────────────
const wipeAll = async () => {
  logger.warn('--fresh flag detected. Wiping all collections...');
  await Promise.all([
    User.deleteMany({}),
    Seller.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Coupon.deleteMany({}),
  ]);
  logger.success('All demo collections wiped.');
};

// ─────────────────────────────────────────────────────────────
// 1. Seed Categories (with subcategories)
// ─────────────────────────────────────────────────────────────
const seedCategories = async () => {
  logger.info('Seeding categories...');
  const catMap = new Map();

  for (const cat of CATEGORIES) {
    let parent = await Category.findOne({ slug: slugify(cat.name) });
    if (!parent) {
      parent = await Category.create({
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        image: cat.image,
        order: cat.order,
        isFeatured: cat.isFeatured,
        level: 0,
      });
      logger.info(`  + Category: ${cat.name}`);
    }
    catMap.set(cat.name, parent);

    if (cat.children) {
      for (const childName of cat.children) {
        const childSlug = slugify(childName);
        let child = await Category.findOne({ slug: childSlug });
        if (!child) {
          child = await Category.create({
            name: childName,
            parent: parent._id,
            level: 1,
          });
          logger.info(`    + Subcategory: ${childName}`);
        }
        catMap.set(childName, child);
      }
    }
  }

  logger.success(`Categories: ${catMap.size} (including subcategories)`);
  return catMap;
};

// ─────────────────────────────────────────────────────────────
// 2. Seed Users (admin, sellers, customers)
// ─────────────────────────────────────────────────────────────
const seedUsers = async () => {
  logger.info('Seeding users...');
  const userMap = new Map();
  const sellerMap = new Map();

  for (const u of DEMO_USERS) {
    let user = await User.findOne({ email: u.email });

    if (!user) {
      user = await User.create({
        name: u.name,
        email: u.email,
        phone: u.phone,
        password: u.password,
        role: u.role,
        emailVerified: u.emailVerified ?? true,
      });
      logger.info(`  + User (${u.role}): ${u.email}`);
    }

    userMap.set(u.email, user);

    if (u.store) {
      let seller = await Seller.findOne({ user: user._id });
      if (!seller) {
        seller = await Seller.create({
          user: user._id,
          storeName: u.store.storeName,
          description: u.store.description,
          businessEmail: u.store.businessEmail,
          businessPhone: u.store.businessPhone,
          businessAddress: u.store.businessAddress,
          status: u.store.status || 'approved',
          commissionPercent: u.store.commissionPercent ?? 10,
          approvedAt: new Date(),
          approvedBy: userMap.get('admin@kelvinikpeni.com')?._id,
        });
        logger.info(`    + Seller profile: ${u.store.storeName}`);
      }
      sellerMap.set(u.store.storeName, seller);
    }
  }

  logger.success(`Users: ${userMap.size}, Sellers: ${sellerMap.size}`);
  return { userMap, sellerMap };
};

// ─────────────────────────────────────────────────────────────
// 3. Seed Products
// ─────────────────────────────────────────────────────────────
const seedProducts = async (categoryMap, sellerMap) => {
  logger.info('Seeding products...');
  const createdProducts = [];

  for (let i = 0; i < DEMO_PRODUCTS.length; i++) {
    const p = DEMO_PRODUCTS[i];
    const sku = skuFrom(p.name, i + 1);

    let existing = await Product.findOne({ sku });
    if (existing) {
      createdProducts.push(existing);
      continue;
    }

    const categoryDoc =
      categoryMap.get(p.category) ||
      categoryMap.get('Electronics') ||
      null;
    if (!categoryDoc) {
      logger.warn(`  ! No category for: ${p.name} (${p.category})`);
      continue;
    }

    const sellerDoc = sellerMap.get(p.seller);
    if (!sellerDoc) {
      logger.warn(`  ! No seller for: ${p.name} (${p.seller})`);
      continue;
    }

    const product = await Product.create({
      name: p.name,
      sku,
      description: p.description,
      shortDescription: p.description.slice(0, 150),
      brand: p.brand,
      category: categoryDoc._id,
      seller: sellerDoc._id,
      price: p.price,
      previousPrice: p.previousPrice,
      stock: p.stock,
      images: [p.image],
      thumbnail: p.image,
      tags: p.tags || [],
      status: 'active',
      isFeatured: p.featured || false,
      isFlashSale: p.flashSale || false,
      flashSaleEndsAt: p.flashSale
        ? new Date(Date.now() + (p.flashHours || 48) * 60 * 60 * 1000)
        : undefined,
      rating: {
        average: (Math.random() * 2 + 3).toFixed(1),
        count: randomBetween(5, 250),
      },
      sold: randomBetween(0, 500),
      views: randomBetween(50, 5000),
      freeShipping: p.price > 50000,
      shippingFee: p.price > 50000 ? 0 : 2500,
    });

    createdProducts.push(product);

    await Seller.findByIdAndUpdate(sellerDoc._id, {
      $inc: { 'stats.totalProducts': 1 },
    });
  }

  logger.success(`Products: ${createdProducts.length}`);
  return createdProducts;
};

// ─────────────────────────────────────────────────────────────
// 4. Seed Reviews
// ─────────────────────────────────────────────────────────────
const seedReviews = async (products, userMap) => {
  logger.info('Seeding reviews...');

  const reviewTexts = [
    { title: 'Excellent product!', comment: 'Exactly as described. Very satisfied with the quality and fast delivery.' },
    { title: 'Great value for money', comment: 'Works perfectly and the price is unbeatable. Would recommend to anyone.' },
    { title: 'Highly recommend', comment: 'Arrived on time and well packaged. The quality exceeded my expectations.' },
    { title: 'Good but could be better', comment: 'Decent product overall. A few minor issues but nothing major.' },
    { title: 'Perfect for my needs', comment: 'Bought this for daily use and it has been reliable so far. Worth every naira.' },
    { title: 'Solid purchase', comment: 'Genuine product, works as advertised. Delivery was quick too.' },
    { title: 'Very happy customer', comment: 'Second time buying from this seller. Always consistent quality.' },
  ];

  const customerEmails = DEMO_USERS.filter((u) => u.role === 'customer').map((u) => u.email);
  let created = 0;

  for (const product of products) {
    const reviewCount = randomBetween(3, 8);
    const usedUsers = new Set();

    for (let i = 0; i < reviewCount; i++) {
      const email = randomFrom(customerEmails);
      if (usedUsers.has(email)) continue;
      usedUsers.add(email);

      const user = userMap.get(email);
      if (!user) continue;

      const exists = await Review.findOne({ product: product._id, user: user._id });
      if (exists) continue;

      const template = randomFrom(reviewTexts);
      await Review.create({
        product: product._id,
        user: user._id,
        rating: randomBetween(4, 5) === 5 && Math.random() > 0.3 ? 5 : randomBetween(3, 5),
        title: template.title,
        comment: template.comment,
        isVerifiedPurchase: Math.random() > 0.3,
        isApproved: true,
      });
      created++;
    }
  }

  logger.success(`Reviews: ${created}`);
  return created;
};

// ─────────────────────────────────────────────────────────────
// 5. Seed Coupons
// ─────────────────────────────────────────────────────────────
const seedCoupons = async (categoryMap, adminId) => {
  logger.info('Seeding coupons...');

  for (const c of DEMO_COUPONS) {
    const exists = await Coupon.findOne({ code: c.code });
    if (exists) continue;

    const categoryIds = c.categoryNames
      ? c.categoryNames.map((n) => categoryMap.get(n)?._id).filter(Boolean)
      : [];

    await Coupon.create({
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      maxDiscount: c.maxDiscount,
      minOrderAmount: c.minOrderAmount,
      appliesTo: c.appliesTo || 'all',
      categoryIds,
      usageLimit: c.usageLimit || 0,
      perUserLimit: c.perUserLimit || 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + (c.validDaysFromNow || 30) * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: adminId,
    });
    logger.info(`  + Coupon: ${c.code}`);
  }

  const total = await Coupon.countDocuments();
  logger.success(`Coupons: ${total}`);
};

// ─────────────────────────────────────────────────────────────
// 6. Sync Category Product Counts
// ─────────────────────────────────────────────────────────────
const syncCategoryCounts = async () => {
  logger.info('Syncing category product counts...');
  const categories = await Category.find({});
  let updated = 0;

  for (const cat of categories) {
    // Count products directly in this category
    let count = await Product.countDocuments({
      category: cat._id,
      status: 'active',
    });

    // If it has children, add their product counts
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
      updated++;
    }
  }

  logger.success(`Category counts synced (${updated} updated)`);
};

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
const run = async () => {
  const start = Date.now();
  try {
    await connectDB();
    logger.info(`Database: ${mongoose.connection.name}`);

    if (FRESH) {
      await wipeAll();
    }

    const categoryMap = await seedCategories();
    const { userMap, sellerMap } = await seedUsers();
    const products = await seedProducts(categoryMap, sellerMap);

    if (!PRODUCTS_ONLY) {
      await seedReviews(products, userMap);
      await seedCoupons(categoryMap, userMap.get('admin@kelvinikpeni.com')?._id);
    }

    // Sync category counts so homepage shows accurate item counts
    await syncCategoryCounts();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    logger.success(`Seeding complete in ${elapsed}s`);
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`);
    console.error(err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();