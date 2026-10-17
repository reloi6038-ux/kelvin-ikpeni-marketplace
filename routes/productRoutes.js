/**
 * routes/productRoutes.js
 * -----------------------
 * Product endpoints. Order matters — specific routes MUST come
 * before the catch-all :slug route.
 *
 * Mounted at /api/products (see routes/index.js).
 */

import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getHomepageData,
  getProductFacets,
  getRelatedProducts,
} from '../controllers/productController.js';

const router = express.Router();

/* ─────────── Specific routes first ─────────── */

// GET /api/products — list with filters, sort, pagination
router.get('/', getProducts);

// GET /api/products/homepage — aggregated homepage sections
router.get('/homepage', getHomepageData);

// GET /api/products/facets — available brands + price range
router.get('/facets', getProductFacets);

// GET /api/products/:slug/related — related products
router.get('/:slug/related', getRelatedProducts);

/* ─────────── Dynamic slug route LAST ─────────── */

// GET /api/products/:slug — single product
router.get('/:slug', getProductBySlug);

export default router;