/**
 * app.js
 * ------
 * Builds and configures the Express application.
 * Does NOT start the HTTP server — that's server.js.
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for Render.com (makes req.ip, req.protocol accurate)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// CROSS-ORIGIN RESOURCE POLICY
// Must be applied before helmet so images load cross-origin.
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// ─────────────────────────────────────────────────────────────
// SECURITY HEADERS (Helmet + CSP)
// We now allow `https:` for images globally — necessary for
// Unsplash images and any external CDN.
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        // Allow all HTTPS images (Unsplash, Cloudinary, etc.)
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://api.paystack.co"],
        frameSrc: ["'self'", "https://checkout.paystack.com"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// ─────────────────────────────────────────────────────────────
// CORS
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
// PAYSTACK WEBHOOK RAW BODY FIX
// Must be registered BEFORE express.json()
// ─────────────────────────────────────────────────────────────
app.use(
  '/api/payments/webhook',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// ─────────────────────────────────────────────────────────────
// BODY PARSERS & UTILITIES
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    etag: true,
  })
);

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
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
// ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, routes);

// ─────────────────────────────────────────────────────────────
// 404 HANDLERS
// ─────────────────────────────────────────────────────────────
app.use('/api', notFound);

app.use((req, res, next) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public/pages/404.html'));
  } else {
    next(notFound(req, res, next));
  }
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;