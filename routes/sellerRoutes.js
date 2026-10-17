import express from 'express';
import {
  registerSeller,
  getSellerDashboard,
  getSellerProducts,
  getSellerOrders,
  fulfillOrder,
} from '../controllers/sellerController.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/sellerProductController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Publicly available to any logged-in user (to apply)
router.post('/register', registerSeller);

// Protected: Requires role='seller'
router.use(requireRole('seller'));

router.get('/dashboard', getSellerDashboard);
router.get('/my-products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.put('/orders/:orderNumber/fulfill', fulfillOrder);

// Product Management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;