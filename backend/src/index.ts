import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";
import reviewRoutes from "./routes/reviews.js";
import collectionRoutes from "./routes/collections.js";
import listRoutes from "./routes/lists.js";
import animeRoutes from "./routes/animes.js";
import recommendationRoutes from "./routes/recommendations.js";
import profileRoutes from "./routes/profiles.js";
import statisticsRoutes from "./routes/statistics.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes publiques
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/animes", animeRoutes);

// Routes protégées
app.use("/api/watchlist", authMiddleware, watchlistRoutes);
app.use("/api/reviews", authMiddleware, reviewRoutes);
app.use("/api/collections", authMiddleware, collectionRoutes);
app.use("/api/lists", authMiddleware, listRoutes);
app.use("/api/recommendations", authMiddleware, recommendationRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/statistics", authMiddleware, statisticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Debug config (remove in production)
app.get("/api/health/config", (req, res) => {
  res.json({
    database_url: process.env.DATABASE_URL ? "***loaded***" : "NOT LOADED",
    node_env: process.env.NODE_ENV,
  });
});

// Error Handler
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
