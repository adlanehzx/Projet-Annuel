import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const [completed, reviews] = await Promise.all([
      prisma.watchlist.findMany({
        where: { userId, status: "COMPLETED" },
        select: { anime: { select: { episodes: true } } },
      }),
      prisma.review.findMany({ where: { userId }, select: { rating: true } }),
    ]);

    const episodeCount = completed.reduce(
      (sum, w) => sum + (w.anime?.episodes || 0),
      0,
    );

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      animeCount: completed.length,
      episodeCount,
      averageRating: Math.round(averageRating * 100) / 100,
      reviewCount: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/genres", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const items = await prisma.watchlist.findMany({
      where: { userId },
      select: {
        anime: {
          select: {
            genres: { select: { genre: { select: { name: true } } } },
          },
        },
      },
    });

    const counts = new Map<string, number>();
    for (const item of items) {
      for (const g of item.anime?.genres ?? []) {
        counts.set(g.genre.name, (counts.get(g.genre.name) || 0) + 1);
      }
    }

    const genres = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
