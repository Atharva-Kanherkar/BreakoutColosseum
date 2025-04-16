import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/user/routes";
import tournamentRoutes from "./modules/tournament/routes";
import matchRoutes from "./modules/match/routes";
import teamRoutes from "./modules/team/routes"; // Add this line
import swaggerUi from 'swagger-ui-express';
import { specs } from './utils/swagger';
import { standardLimiter, authLimiter } from './middlewares/rateLimit';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 4000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Middleware
app.use(express.json());

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/users', standardLimiter, userRoutes);
app.use('/tournaments', standardLimiter, tournamentRoutes);
app.use('/matches', standardLimiter, matchRoutes);
app.use('/teams', standardLimiter, teamRoutes); // Add this line

app.get("/", (req, res) => {
  res.send("Game Tournament API");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});