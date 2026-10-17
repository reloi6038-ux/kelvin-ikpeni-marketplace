/**
 * controllers/sellerProductController.js
 * --------------------------------------
 * Seller product management (CRUD).
 */

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

/* ═══════════════════════════════════════════════════════════
   POST /api/seller-products
   ═══════════════════════════════════════════════════════════ */
export const createProduct = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller || seller.status !== 'approved') throw ApiError.forbidden('Approved seller account required');

  const { name, category, price, stock, description, brand, images } = req.body;
  if (!name || !category || !price || stock === undefined) {
    throw ApiError.badRequest('name, category, price, and stock are required');
  }

  // Generate unique SKU
  const prefix = name.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w.slice(0, 3).toUpperCase()).join('');
  const random = Math.floor(10000 + Math.random() * 90000);
  const sku = `KIM-${prefix}-${random}`;

  const product = await Product.create({
    seller: seller._id,
    name,
    category,
    price,
    stock,
    description: description || name,
    brand: brand || seller.storeName,
    sku,
    images: images || ['/images/placeholders/product.svg'],
    thumbnail: images?.[0] || '/images/placeholders/product.svg',
    status: 'pending', // Admin must approve
  });

  await Seller.findByIdAndUpdate(seller._id, { $inc: { 'stats.totalProducts': 1 } });

  res.status(201).json(new ApiResponse(201, product, 'Product created and pending approval'));
});

/* ═══════════════════════════════════════════════════════════
   PUT /api/seller-products/:id
   ═══════════════════════════════════════════════════════════ */
export const updateProduct = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) throw ApiError.forbidden('Seller account required');

  const product = await Product.findOne({ _id: req.params.id, seller: seller._id });
  if (!product) throw ApiError.notFound('Product not found or you do not own it');

  const { name, price, stock, description, brand, images, status } = req.body;
  
  if (name) product.name = name;
  if (price) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (description) product.description = description;
  if (brand) product.brand = brand;
  if (images) {
    product.images = images;
    product.thumbnail = images[0];
  }
  // Sellers can only change status between active/archived (not pending approval)
  if (status && ['active', 'archived'].includes(status) && product.status !== 'pending') {
    product.status = status;
  }

  await product.save();
  res.status(200).json(new ApiResponse(200, product, 'Product updated'));
});

/* ═══════════════════════════════════════════════════════════
   DELETE /api/seller-products/:id
   ═══════════════════════════════════════════════════════════ */
export const deleteProduct = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });
  if (!seller) throw ApiError.forbidden('Seller account required');

  const product = await Product.findOneAndDelete({ _id: req.params.id, seller: seller._id });
  if (!product) throw ApiError.notFound('Product not found or you do not own it');

  await Seller.findByIdAndUpdate(seller._id, { $inc: { 'stats.totalProducts': -1 } });

  res.status(200).json(new ApiResponse(200, null, 'Product deleted'));
});

export default {
  createProduct,
  updateProduct,
  deleteProduct,
};