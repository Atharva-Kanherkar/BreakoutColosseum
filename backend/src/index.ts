import express from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Adjust path if needed

import cors from 'cors';

import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/user/routes";
import tournamentRoutes from "./modules/tournament/routes";
import teamRoutes from "./modules/team/routes";
import matchRoutes from './modules/match/routes'
import { standardLimiter, authLimiter } from './middlewares/rateLimit';
import swaggerUi from 'swagger-ui-express';
import { specs } from './utils/swagger';
import 'dotenv/config';
// Load environment variables
 

const app = express();
const port = process.env.PORT || 4000;

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Whitelist in production
    : ['http://localhost:3000'], // Allow local frontend in dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Body parser
app.use(express.json());

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/users', standardLimiter, userRoutes);
app.use('/tournaments', standardLimiter, tournamentRoutes);
app.use('/teams', standardLimiter, teamRoutes);
app.use('/matches', standardLimiter, matchRoutes);

// Catch-all error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});