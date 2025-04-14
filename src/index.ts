import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/user/routes";
import tournamentRoutes from "./modules/tournament/routes";
import matchRoutes from "./modules/match/routes";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/', tournamentRoutes);
app.use('/', matchRoutes); // Mount match routes

app.get("/", (req, res) => {
  res.send("Game Tournament API");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;