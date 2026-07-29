import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";
import reviewRoutes from "./routes/reviews.js";
import collectionRoutes from "./routes/collections.js";
import listRoutes from "./routes/lists.js";
import animeRoutes from "./routes/animes.js";
import recommendationRoutes from "./routes/recommendations.js";
import profileRoutes from "./routes/profiles.js";
import myProfileRoutes from "./routes/profile.js";
import statisticsRoutes from "./routes/statistics.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth.js";
import { env } from "./config/env.js";
import { setSocketServer } from "./realtime/socket.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

io.use((socket, next) => {
  const token =
    (socket.handshake.auth?.token as string | undefined) ||
    (socket.handshake.query?.token as string | undefined);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as any;
    (socket.data as any).userId = decoded.id;
    return next();
  } catch {
    return next(new Error("Token invalide"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket.data as any).userId;

  if (typeof userId === "number") {
    socket.join(`user:${userId}`);
  }

  socket.on("subscribe:anime", (animeId: number) => {
    if (typeof animeId !== "number" || Number.isNaN(animeId)) return;
    socket.join(`anime:${animeId}`);
  });

  socket.on("unsubscribe:anime", (animeId: number) => {
    if (typeof animeId !== "number" || Number.isNaN(animeId)) return;
    socket.leave(`anime:${animeId}`);
  });
});

setSocketServer(io);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/profiles", optionalAuthMiddleware, profileRoutes);
app.use("/api/profile", authMiddleware, myProfileRoutes);
app.use("/api/animes", animeRoutes);

app.use("/api/watchlist", authMiddleware, watchlistRoutes);
app.use("/api/reviews", optionalAuthMiddleware, reviewRoutes);
app.use("/api/collections", authMiddleware, collectionRoutes);
app.use("/api/lists", authMiddleware, listRoutes);
app.use("/api/recommendations", authMiddleware, recommendationRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/statistics", authMiddleware, statisticsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

if (env.nodeEnv !== "production") {
  app.get("/api/health/config", (req, res) => {
    res.json({
      database_url: process.env.DATABASE_URL ? "***loaded***" : "NOT LOADED",
      node_env: env.nodeEnv,
    });
  });
}

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
