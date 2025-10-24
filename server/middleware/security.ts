// ⚠️ DEVELOPMENT ENVIRONMENT - Security Middleware
// Rate limiting, CORS, and Helmet configuration

import { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

/**
 * Configure security middleware for Express app
 */
export function configureSecurity(app: Express) {
  // 1. Helmet - Security headers
  configureHelmet(app);

  // 2. CORS - Cross-Origin Resource Sharing
  configureCORS(app);

  // 3. Rate Limiting
  configureRateLimiting(app);

  console.log('✅ Security middleware configured');
}

/**
 * Configure Helmet for security headers
 */
function configureHelmet(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // ⚠️ DEV: unsafe-eval for hot reload
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // ⚠️ DEV: Allow embedding
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  console.log('   ✅ Helmet configured (security headers)');
}

/**
 * Configure CORS
 */
function configureCORS(app: Express) {
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [
        'http://localhost:5000',
        'http://localhost:3000',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:3000',
      ];

  // ⚠️ DEVELOPMENT: Allow all origins in dev mode
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    console.warn('   ⚠️  CORS: Development mode - allowing all origins');
  }

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      // In development, allow all origins
      if (isDevelopment) return callback(null, true);

      // In production, check whitelist
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  console.log('   ✅ CORS configured');
  console.log(`      Allowed origins: ${isDevelopment ? 'ALL (dev mode)' : allowedOrigins.join(', ')}`);
}

/**
 * Configure Rate Limiting
 */
function configureRateLimiting(app: Express) {
  // General API rate limit
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limit for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
  });

  // Scraper API rate limit
  const scraperLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 scrape requests per minute
    message: 'Too many scraping requests, please try again later.',
  });

  // API creation rate limit
  const createLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 create requests per minute
    message: 'Too many creation requests, please try again later.',
  });

  // Apply rate limiters
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/scraper/', scraperLimiter);
  app.use('/api/*/create', createLimiter);
  app.use('/api/comments', createLimiter);

  console.log('   ✅ Rate limiting configured');
  console.log('      General API: 100 req/15min');
  console.log('      Auth endpoints: 5 req/15min');
  console.log('      Scraper API: 10 req/min');
  console.log('      Create endpoints: 20 req/min');
}

/**
 * Health check endpoint (no rate limiting)
 */
export function setupHealthCheck(app: Express) {
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  console.log('✅ Health check endpoint: /api/health');
}
