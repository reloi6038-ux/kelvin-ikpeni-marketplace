import express from 'express';
import {
  getProductReviews,
  getReviewStats,
  createReview,
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/stats', getReviewStats);
router.post('/', requireAuth, createReview);

export default router;