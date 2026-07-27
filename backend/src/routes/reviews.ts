import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();
const MIN_COMMENT_LENGTH = 50;

const parseId = (value: string) => {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
};

const validateReviewPayload = (rating: unknown, comment: unknown) => {
  if (typeof rating !== "number" || Number.isNaN(rating) || rating < 0 || rating > 10) {
    return "La note doit être entre 0 et 10";
  }

  if (typeof comment !== "string" || comment.trim().length < MIN_COMMENT_LENGTH) {
    return `Le commentaire doit contenir au moins ${MIN_COMMENT_LENGTH} caractères`;
  }

  return null;
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        watchlist: {
          select: {
            animeId: true,
            title: true,
            posterPath: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const { watchlistId, rating, comment } = req.body;
    const parsedWatchlistId = Number.parseInt(String(watchlistId), 10);

    if (Number.isNaN(parsedWatchlistId)) {
      return res.status(400).json({ error: "watchlistId invalide" });
    }

    const payloadError = validateReviewPayload(rating, comment);
    if (payloadError) {
      return res.status(400).json({ error: payloadError });
    }

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: parsedWatchlistId },
      select: { id: true, animeId: true, userId: true },
    });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist introuvable" });
    }

    if (watchlist.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const existing = await prisma.review.findFirst({
      where: {
        userId,
        watchlist: {
          animeId: watchlist.animeId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({
        error: "Vous avez déjà publié une review pour cet anime",
      });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        watchlistId: parsedWatchlistId,
        rating,
        comment: comment.trim(),
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviewId = parseId(req.params.id);
    if (!reviewId) return res.status(400).json({ error: "id invalide" });

    const { rating, comment } = req.body;
    const payloadError = validateReviewPayload(rating, comment);
    if (payloadError) {
      return res.status(400).json({ error: payloadError });
    }

    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Review introuvable" });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment.trim(),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/movie/:watchlistId", async (req: Request, res: Response) => {
  try {
    const watchlistId = parseId(req.params.watchlistId);
    if (!watchlistId) {
      return res.status(400).json({ error: "watchlistId invalide" });
    }

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
      select: { animeId: true },
    });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist introuvable" });
    }

    const reviews = await prisma.review.findMany({
      where: {
        watchlist: {
          animeId: watchlist.animeId,
        },
      },
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
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const watchlistId = parseId(req.params.watchlistId);
    if (!watchlistId) {
      return res.status(400).json({ error: "watchlistId invalide" });
    }

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
      select: { userId: true },
    });

    if (!watchlist) {
      return res.status(404).json({ error: "Watchlist introuvable" });
    }

    if (watchlist.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const review = await prisma.review.findUnique({
      where: {
        userId_watchlistId: {
          userId,
          watchlistId,
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
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const reviewId = parseId(req.params.id);
    if (!reviewId) return res.status(400).json({ error: "id invalide" });

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
