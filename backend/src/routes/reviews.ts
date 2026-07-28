import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { recalculateAnimeRatingByWatchlistId } from "../services/animeRatings.js";
import { emitToAll, emitToRoom, emitToUser } from "../realtime/socket.js";

const prisma = new PrismaClient();
const router = Router();
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const { watchlistId, rating, comment, hasSpoilers } = req.body;

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ error: "La note doit être entre 0 et 10" });
    }

    const existing = await prisma.review.findUnique({
      where: { userId_watchlistId: { userId, watchlistId } },
      include: { watchlist: { select: { animeId: true } } },
    });

    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment, hasSpoilers: !!hasSpoilers },
      });

      await recalculateAnimeRatingByWatchlistId(existing.watchlistId);
      emitToUser(userId, "profile:stats-updated", {
        reason: "review-updated",
        watchlistId: existing.watchlistId,
      });
      emitToRoom(`anime:${existing.watchlist.animeId}`, "review:list-changed", {
        animeId: existing.watchlist.animeId,
      });
      return res.json(updated);
    }

    const watchlistEntry = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
      select: { animeId: true },
    });

    const review = await prisma.review.create({
      data: { userId, watchlistId, rating, comment, hasSpoilers: !!hasSpoilers },
    });

    await recalculateAnimeRatingByWatchlistId(review.watchlistId);

    emitToUser(userId, "profile:stats-updated", {
      reason: "review-created",
      watchlistId: review.watchlistId,
    });
    emitToAll("stats:global-changed", { reason: "review-created" });
    if (watchlistEntry) {
      emitToRoom(`anime:${watchlistEntry.animeId}`, "review:list-changed", {
        animeId: watchlistEntry.animeId,
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        watchlist: { include: { anime: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json(
      reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        watchlistItem: {
          anime: { title: r.watchlist.anime?.title ?? r.watchlist.title },
        },
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviewId = parseInt(req.params.id);
    const { rating, comment, hasSpoilers } = req.body;

    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ error: "La note doit être entre 0 et 10" });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { watchlist: { select: { animeId: true } } },
    });

    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment, hasSpoilers: !!hasSpoilers },
    });

    await recalculateAnimeRatingByWatchlistId(review.watchlistId);
    emitToUser(userId, "profile:stats-updated", {
      reason: "review-updated",
      watchlistId: review.watchlistId,
    });
    emitToRoom(`anime:${review.watchlist.animeId}`, "review:list-changed", {
      animeId: review.watchlist.animeId,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/anime/:animeId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const animeId = parseInt(req.params.animeId);

    const reviews = await prisma.review.findMany({
      where: { watchlist: { animeId } },
      include: {
        user: { select: { username: true, avatar: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      reviews.map((review) => ({
        ...review,
        likesCount: review._count.likes,
        likedByMe: userId ? review.likes.length > 0 : false,
        likes: undefined,
        _count: undefined,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/movie/:watchlistId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const watchlistEntry = await prisma.watchlist.findUnique({
      where: { id: parseInt(req.params.watchlistId) },
      select: { animeId: true },
    });

    if (!watchlistEntry) {
      return res.json([]);
    }

    const reviews = await prisma.review.findMany({
      where: { watchlist: { animeId: watchlistEntry.animeId } },
      include: {
        user: { select: { username: true, avatar: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const payload = reviews.map((review) => ({
      ...review,
      likesCount: review._count.likes,
      likedByMe: userId ? review.likes.length > 0 : false,
      likes: undefined,
      _count: undefined,
    }));

    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/:watchlistId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const review = await prisma.review.findUnique({
      where: {
        userId_watchlistId: {
          userId,
          watchlistId: parseInt(req.params.watchlistId),
        },
      },
    });

    res.json(review || null);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { watchlist: { select: { animeId: true } } },
    });

    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const deletedWatchlistId = review.watchlistId;
    const animeId = review.watchlist.animeId;
    await prisma.review.delete({ where: { id: parseInt(req.params.id) } });
    await recalculateAnimeRatingByWatchlistId(deletedWatchlistId);
    emitToUser(userId, "profile:stats-updated", {
      reason: "review-deleted",
      watchlistId: deletedWatchlistId,
    });
    emitToAll("stats:global-changed", { reason: "review-deleted" });
    emitToRoom(`anime:${animeId}`, "review:list-changed", { animeId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviewId = parseInt(req.params.id);
    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { watchlist: { select: { animeId: true } } },
    });

    if (!review) {
      return res.status(404).json({ error: "Review introuvable" });
    }

    await prisma.reviewLike.upsert({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
      create: {
        userId,
        reviewId,
      },
      update: {},
    });

    const likesCount = await prisma.reviewLike.count({ where: { reviewId } });

    emitToRoom(`anime:${review.watchlist.animeId}`, "review:like-updated", {
      reviewId,
      likesCount,
    });

    res.json({ reviewId, likesCount, likedByMe: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id/like", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviewId = parseInt(req.params.id);
    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { watchlist: { select: { animeId: true } } },
    });

    if (!review) {
      return res.status(404).json({ error: "Review introuvable" });
    }

    await prisma.reviewLike.deleteMany({
      where: {
        userId,
        reviewId,
      },
    });

    const likesCount = await prisma.reviewLike.count({ where: { reviewId } });

    emitToRoom(`anime:${review.watchlist.animeId}`, "review:like-updated", {
      reviewId,
      likesCount,
    });

    res.json({ reviewId, likesCount, likedByMe: false });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
