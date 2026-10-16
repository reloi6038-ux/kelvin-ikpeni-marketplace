import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { ApiResponse } from './utils/ApiResponse.js';

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Trust proxy (Render sits behind a proxy) ───
app.set('trust proxy', 1);

// ─── Security headers ───
app.use(helmet({
  contentSecurityPolicy: false, // we'll configure CSP later for CDN images
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ───
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));

// ─── Body parsers ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Compression ───
app.use(compression());

// ─── Request logging ───
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Static files (frontend) ───
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.status(200).json(new ApiResponse(200, {
    status: 'ok',
    service: 'Kelvin Ikpeni Marketplace API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Server is healthy'));
});

// ─── API routes (added in later stages) ───
// import routes from './routes/index.js';
// app.use('/api', apiLimiter, routes);

// ─── 404 handler (after all routes) ───
app.use(notFound);

// ─── Global error handler (must be last) ───
app.use(errorHandler);

export default app;