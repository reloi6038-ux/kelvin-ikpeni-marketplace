import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Category from '../models/Category.js';

/**
 * GET /api/categories
 * Returns all active categories, parent + children, sorted by `order`.
 */
export const getCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.featured === 'true') filter.isFeatured = true;
  if (req.query.level) filter.level = Number(req.query.level);

  const categories = await Category.find(filter)
    .sort({ order: 1, name: 1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, { count: categories.length, categories }, 'Categories fetched')
  );
});

/**
 * GET /api/categories/:slug
 * Single category with its children.
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();
  if (!category) throw ApiError.notFound('Category not found');

  const children = await Category.find({ parent: category._id, isActive: true })
    .sort({ order: 1 })
    .lean();

  res.status(200).json(new ApiResponse(200, { ...category, children }, 'Category fetched'));
});

export default { getCategories, getCategoryBySlug };