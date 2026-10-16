/**
 * controllers/productController.js
 * --------------------------------
 * Handles all product-related endpoints:
 *  - getProducts        → GET /api/products (filters, sort, pagination)
 *  - getProductBySlug   → GET /api/products/:slug
 *  - getHomepageData    → GET /api/products/homepage
 *  - getProductFacets   → GET /api/products/facets (brands + price range)
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

/* ═══════════════════════════════════════════════════════════
   GET /api/products
   Supports: category, search, minPrice, maxPrice, brand,
             rating, inStock, onSale, discountMin, featured,
             flashSale, sort, page, limit
   ═══════════════════════════════════════════════════════════ */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    brand,
    rating,
    sort = 'latest',
    page = 1,
    limit = 20,
    featured,
    flashSale,
    inStock,
    onSale,
    discountMin,
  } = req.query;

  const filter = { status: 'active' };

  // Category + subcategories
  if (category) {
    const cat = await Category.findOne({ slug: category }).select('_id');
    if (cat) {
      const children = await Category.find({ parent: cat._id }).select('_id');
      const categoryIds = [cat._id, ...children.map((c) => c._id)];
      filter.category = { $in: categoryIds };
    }
  }

  // Text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Brands
  if (brand) {
    filter.brand = { $in: brand.split(',').map((b) => b.trim()) };
  }

  // Rating minimum
  if (rating) filter['rating.average'] = { $gte: Number(rating) };

  // Availability
  if (inStock === 'true') filter.stock = { $gt: 0 };

  // On-sale (previousPrice > price)
  if (onSale === 'true') {
    filter.$expr = { $gt: ['$previousPrice', '$price'] };
  }

  // Discount minimum
  if (discountMin) {
    filter.discountPercent = { $gte: Number(discountMin) };
  }

  // Featured
  if (featured === 'true') filter.isFeatured = true;

  // Flash sale
  if (flashSale === 'true') {
    filter.isFlashSale = true;
    filter.flashSaleEndsAt = { $gt: new Date() };
  }

  // Sort
  const sortMap = {
    latest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { 'rating.average': -1, 'rating.count': -1 },
    popular: { sold: -1, views: -1 },
    discount: { discountPercent: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.latest;

  // Pagination
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(60, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug')
      .populate('seller', 'storeName slug')
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
      'Products fetched'
    )
  );
});

/* ═══════════════════════════════════════════════════════════
   GET /api/products/:slug
   ═══════════════════════════════════════════════════════════ */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
    .populate('category', 'name slug')
    .populate('seller', 'storeName slug rating');

  if (!product) throw ApiError.notFound('Product not found');

  // Increment view count (fire-and-forget)
  Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).catch(() => {});

  res.status(200).json(new ApiResponse(200, product, 'Product fetched'));
});

/* ═══════════════════════════════════════════════════════════
   GET /api/products/homepage
   Aggregated homepage sections.
   ═══════════════════════════════════════════════════════════ */
export const getHomepageData = asyncHandler(async (req, res) => {
  const limit = 8;

  const [
    featuredProducts,
    trendingProducts,
    bestSellers,
    newArrivals,
    recommended,
    flashSaleProducts,
    featuredCategories,
  ] = await Promise.all([
    Product.find({ status: 'active', isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Product.find({ status: 'active' })
      .sort({ views: -1 })
      .limit(limit)
      .lean(),
    Product.find({ status: 'active' })
      .sort({ sold: -1 })
      .limit(limit)
      .lean(),
    Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Product.find({ status: 'active', 'rating.average': { $gte: 4 } })
      .sort({ 'rating.average': -1 })
      .limit(limit)
      .lean(),
    Product.find({
      status: 'active',
      isFlashSale: true,
      flashSaleEndsAt: { $gt: new Date() },
    })
      .sort({ flashSaleEndsAt: 1 })
      .limit(limit)
      .lean(),
    Category.find({ isActive: true, level: 0 })
      .sort({ order: 1 })
      .limit(15)
      .lean(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        featuredProducts,
        trendingProducts,
        bestSellers,
        newArrivals,
        recommended,
        flashSaleProducts,
        categories: featuredCategories,
      },
      'Homepage data fetched'
    )
  );
});

/* ═══════════════════════════════════════════════════════════
   GET /api/products/facets
   Returns available brands + price range for filter sidebar.
   ═══════════════════════════════════════════════════════════ */
export const getProductFacets = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const match = { status: 'active' };

  if (category) {
    const cat = await Category.findOne({ slug: category }).select('_id');
    if (cat) {
      const children = await Category.find({ parent: cat._id }).select('_id');
      match.category = { $in: [cat._id, ...children.map((c) => c._id)] };
    }
  }

  const [brandsAgg, priceAgg] = await Promise.all([
    Product.aggregate([
      { $match: match },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]),
    Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
        },
      },
    ]),
  ]);

  const brands = brandsAgg
    .filter((b) => b._id)
    .map((b) => ({ name: b._id, count: b.count }));

  const priceRange = priceAgg[0] || { min: 0, max: 0 };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        brands,
        priceRange: {
          min: Math.floor(priceRange.min || 0),
          max: Math.ceil(priceRange.max || 0),
        },
      },
      'Facets fetched'
    )
  );
});

/* ═══════════════════════════════════════════════════════════
   Default export
   ═══════════════════════════════════════════════════════════ */
export default {
  getProducts,
  getProductBySlug,
  getHomepageData,
  getProductFacets,
};