import express from 'express';
import { createOrder, getMyOrders, getOrder } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:orderNumber', getOrder);

export default router;