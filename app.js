/**
 * app.js
 * ------
 * Builds and configures the Express application.
 * Does NOT start the HTTP server — that's server.js.
 *
 * Keeping app.js separate from server.js is important for:
 *   1. Testing — Supertest can import `app` without opening a port
 *   2. Deployment — Render/other hosts can require just the app
 *   3. Clarity — one file configures, another file boots
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Middleware ───
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// ─── Utils ───
import { ApiResponse } from './utils/ApiResponse.js';

// ─── API Routes ───
import routes from './routes/index.js';

// ─────────────────────────────────────────────────────────────
// __dirname equivalent for ES modules
// ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────
// Create Express app
// ─────────────────────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────────────────────
// Trust proxy — required on Render.com (which sits behind a proxy)
// Makes req.ip and req.protocol accurate.
// ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// Security headers (helmet)
// CSP is disabled for now so we can load Cloudinary images,
// Google Fonts, and Unsplash images. We'll turn on a strict CSP
// in Stage 17 (Security Hardening).
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// ─────────────────────────────────────────────────────────────
// CORS — allow the frontend origin to call the API
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─────────────────────────────────────────────────────────────
// Body parsers
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────────────────────
// Cookie parser — reads cookies into req.cookies
// ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ─────────────────────────────────────────────────────────────
// Response compression (gzip)
// ─────────────────────────────────────────────────────────────
app.use(compression());

// ─────────────────────────────────────────────────────────────
// HTTP request logging
// ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─────────────────────────────────────────────────────────────
// Static files — serve the frontend from public/
// ─────────────────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    etag: true,
  })
);

// ─────────────────────────────────────────────────────────────
// API: Health check with live database status
// Used by:
//  - You, to verify things work after every change
//  - Render.com, to detect if the service is alive
//  - Uptime monitors in production
// ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const mongoose = (await import('mongoose')).default;

  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };

  const readyState = mongoose.connection.readyState;
  const dbState = states[readyState] || 'unknown';

  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'ok',
        service: 'Kelvin Ikpeni Marketplace API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: Number(process.uptime().toFixed(2)),
        database: {
          state: dbState,
          name: mongoose.connection.name || null,
          host: mongoose.connection.host || null,
          readyState,
        },
      },
      'Server is healthy'
    )
  );
});

// ─────────────────────────────────────────────────────────────
// API ROUTES
// Mounted at /api. Rate limiter applied globally here.
//
// Routes currently mounted (Stage 7):
//   GET  /api/categories
//   GET  /api/categories/:slug
//   GET  /api/products
//   GET  /api/products/homepage
//   GET  /api/products/:slug
//
// Future stages will add:
//   /api/auth        (Stage 10)
//   /api/cart        (Stage 11)
//   /api/wishlist    (Stage 11)
//   /api/orders      (Stage 12)
//   /api/payments    (Stage 13)
//   /api/reviews     (Stage 9)
//   /api/sellers     (Stage 14)
//   /api/admin       (Stage 15)
//   /api/coupons     (Stage 12)
// ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, routes);

// ─────────────────────────────────────────────────────────────
// 404 handler — must come AFTER all routes
// ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─────────────────────────────────────────────────────────────
// Global error handler — must be the LAST middleware
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Export for server.js and tests
// ─────────────────────────────────────────────────────────────
export default app;