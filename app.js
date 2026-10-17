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

// Trust proxy for Render.com (accurate req.ip and req.protocol)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// Cross-Origin Resource Policy (must come before helmet)
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// ─────────────────────────────────────────────────────────────
// Security headers (helmet)
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'https://api.paystack.co'],
        frameSrc: ["'self'", 'https://checkout.paystack.com'],
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
// Paystack webhook needs raw body — register BEFORE express.json()
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
// Body parsers & utilities
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

// ─────────────────────────────────────────────────────────────
// Static files — CRITICAL CACHE CONFIGURATION
// HTML: never cache (so updates take effect immediately)
// Assets (CSS/JS/images/fonts): cache for 7 days (performance)
// ─────────────────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, 'public'), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // HTML must always be fresh — no caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } else if (/\.(css|js|mjs|jpg|jpeg|png|gif|svg|webp|ico|woff2?|ttf|otf)$/i.test(filePath)) {
        // Static assets — safe to cache
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      } else {
        // JSON, XML, txt — short cache
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    },
  })
);

// ─────────────────────────────────────────────────────────────
// Health check
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
// API routes
// ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, routes);

// ─────────────────────────────────────────────────────────────
// 404 handling
// API requests → JSON 404
// HTML requests → nice 404 page
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
// Global error handler (must be last)
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;