import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { recalculateAnimeRatingByWatchlistId } from "../services/animeRatings.js";

const prisma = new PrismaClient();
const router = Router();
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const { watchlistId, rating, comment } = req.body;

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ error: "La note doit être entre 0 et 10" });
    }

    const existing = await prisma.review.findUnique({
      where: { userId_watchlistId: { userId, watchlistId } },
    });

    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment },
      });

      await recalculateAnimeRatingByWatchlistId(existing.watchlistId);
      return res.json(updated);
    }

    const review = await prisma.review.create({
      data: { userId, watchlistId, rating, comment },
    });

    await recalculateAnimeRatingByWatchlistId(review.watchlistId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviewId = parseInt(req.params.id);
    const { rating, comment } = req.body;

    if (Number.isNaN(reviewId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ error: "La note doit être entre 0 et 10" });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
    });

    await recalculateAnimeRatingByWatchlistId(review.watchlistId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/movie/:watchlistId", async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { watchlistId: parseInt(req.params.watchlistId) },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
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
    });

    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const deletedWatchlistId = review.watchlistId;
    await prisma.review.delete({ where: { id: parseInt(req.params.id) } });
    await recalculateAnimeRatingByWatchlistId(deletedWatchlistId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
