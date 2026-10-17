import express from 'express';
import { initializePayment, verifyPayment, paystackWebhook } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/webhook', paystackWebhook);
router.post('/initialize', requireAuth, initializePayment);
router.get('/verify/:reference', requireAuth, verifyPayment);

export default router;