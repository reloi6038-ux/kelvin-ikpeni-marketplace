import express from 'express';
import {
  getAdminDashboard,
  getPendingSellers,
  approveSeller,
  getPendingProducts,
  approveProduct,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Require admin role for all routes in this file
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/approve', approveSeller);
router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);

export default router;