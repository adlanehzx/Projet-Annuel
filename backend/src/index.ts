import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import tmdbRoutes from "./routes/tmdb.js";
import watchlistRoutes from "./routes/watchlist.js";
import reviewRoutes from "./routes/reviews.js";
import collectionRoutes from "./routes/collections.js";
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
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/auth", authRoutes);

// Routes protégées
app.use("/api/watchlist", authMiddleware, watchlistRoutes);
app.use("/api/reviews", authMiddleware, reviewRoutes);
app.use("/api/collections", authMiddleware, collectionRoutes);
app.use("/api/users", authMiddleware, userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Debug config (remove in production)
app.get("/api/health/config", (req, res) => {
  res.json({
    tmdb_api_key: process.env.TMDB_API_KEY ? "***loaded***" : "NOT LOADED",
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
