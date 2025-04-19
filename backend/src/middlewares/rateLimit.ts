 // src/middlewares/rateLimit.ts

import rateLimit from 'express-rate-limit';

// Basic rate limit for most routes
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});