/**
 * controllers/wishlistController.js
 * ---------------------------------
 *  - GET    /api/wishlist
 *  - POST   /api/wishlist/add      { productId }
 *  - DELETE /api/wishlist/remove/:productId
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  const products = await Product.find({ _id: { $in: wishlist.products }, status: 'active' }).lean();

  res.status(200).json(
    new ApiResponse(200, { products, count: products.length }, 'Wishlist fetched')
  );
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw ApiError.badRequest('productId is required');

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.status(200).json(
    new ApiResponse(200, { count: wishlist.products.length }, 'Added to wishlist')
  );
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
    await wishlist.save();
  }

  res.status(200).json(
    new ApiResponse(200, { count: wishlist?.products.length || 0 }, 'Removed from wishlist')
  );
});

export default { getWishlist, addToWishlist, removeFromWishlist };