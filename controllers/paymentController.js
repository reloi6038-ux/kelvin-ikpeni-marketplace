/**
 * controllers/paymentController.js
 * --------------------------------
 * Paystack integration (test mode by default).
 */

import crypto from 'crypto';
import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { logger } from '../utils/logger.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/* ═══════════════════════════════════════════════════════════
   POST /api/payments/initialize
   Body: { orderNumber }
   ═══════════════════════════════════════════════════════════ */
export const initializePayment = asyncHandler(async (req, res) => {
  const { orderNumber } = req.body;
  if (!orderNumber) throw ApiError.badRequest('orderNumber required');
  if (!PAYSTACK_SECRET) throw ApiError.internal('Paystack not configured');

  const order = await Order.findOne({ orderNumber, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.paymentStatus === 'paid') throw ApiError.badRequest('Order already paid');

  const reference = `KIM-PAY-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Paystack takes amount in kobo (multiply naira by 100)
  const amountKobo = order.total * 100;

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email: req.user.email,
      amount: amountKobo,
      reference,
      currency: 'NGN',
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/pages/payment-callback.html`,
      metadata: {
        orderNumber: order.orderNumber,
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    },
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  );

  const payData = response.data.data;

  await Payment.create({
    order: order._id,
    user: req.user._id,
    provider: 'paystack',
    reference: payData.reference,
    amount: order.total,
    currency: 'NGN',
    status: 'pending',
  });

  res.status(200).json(
    new ApiResponse(200, {
      authorizationUrl: payData.authorization_url,
      accessCode: payData.access_code,
      reference: payData.reference,
    }, 'Payment initialized')
  );
});

/* ═══════════════════════════════════════════════════════════
   GET /api/payments/verify/:reference
   ═══════════════════════════════════════════════════════════ */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  if (!PAYSTACK_SECRET) throw ApiError.internal('Paystack not configured');

  const payment = await Payment.findOne({ reference, user: req.user._id });
  if (!payment) throw ApiError.notFound('Payment record not found');

  if (payment.status === 'success') {
    res.status(200).json(new ApiResponse(200, { status: 'success' }, 'Payment already verified'));
    return;
  }

  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });

  const data = response.data.data;

  if (data.status === 'success') {
    payment.status = 'success';
    payment.channel = data.channel;
    payment.providerResponse = data;
    payment.verifiedAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.paidAt = new Date();
      order.paymentReference = reference;
      order.timeline.push({
        status: 'processing',
        note: 'Payment verified successfully',
        at: new Date(),
      });
      await order.save();
    }

    res.status(200).json(new ApiResponse(200, { status: 'success', orderNumber: order?.orderNumber }, 'Payment verified'));
  } else {
    payment.status = 'failed';
    payment.failureReason = data.gateway_response || 'Payment failed';
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'failed';
      order.timeline.push({ status: 'pending', note: 'Payment failed', at: new Date() });
      await order.save();
    }

    res.status(400).json(new ApiResponse(400, { status: 'failed' }, 'Payment failed'));
  }
});

/* ═══════════════════════════════════════════════════════════
   POST /api/payments/webhook  (Paystack calls this)
   NOTE: Must be raw-body parsed; see app.js adjustment
   ═══════════════════════════════════════════════════════════ */
export const paystackWebhook = asyncHandler(async (req, res) => {
  if (!PAYSTACK_SECRET) return res.status(500).end();

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, amount, status } = event.data;
    const payment = await Payment.findOne({ reference });
    if (payment && payment.status !== 'success') {
      payment.status = 'success';
      payment.providerResponse = event.data;
      payment.verifiedAt = new Date();
      await payment.save();

      const order = await Order.findById(payment.order);
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.paidAt = new Date();
        order.paymentReference = reference;
        order.timeline.push({ status: 'processing', note: 'Webhook: payment succeeded', at: new Date() });
        await order.save();
      }
    }
  }

  res.status(200).end();
});

export default { initializePayment, verifyPayment, paystackWebhook };