import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET /api/profiles/:username - Récupérer le profil public d'un utilisateur
router.get("/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        isPublic: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Si le profil n'est pas public et l'utilisateur n'est pas le propriétaire
    const userId = req.userId;
    if (!user.isPublic && user.id !== userId) {
      return res.status(403).json({ error: "Ce profil n'est pas public" });
    }

    // Récupérer les collections publiques
    const publicCollections = await prisma.collection.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      include: {
        items: {
          include: {
            watchlist: {
              select: {
                animeId: true,
                title: true,
                posterPath: true,
                anime: true,
              },
            },
          },
        },
      },
    });

    // Statistiques publiques
    const completedCount = await prisma.watchlist.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    });

    const reviewsCount = await prisma.review.count({
      where: { userId: user.id },
    });

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      profile: user,
      statistics: {
        completedAnimes: completedCount,
        reviewsCount,
        averageRating: Math.round(averageRating * 100) / 100,
      },
      publicCollections,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/profiles/:username/reviews - Récupérer les reviews publiques d'un utilisateur
router.get("/:username/reviews", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPublic: true },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Vérifier que le profil est public
    const userId = req.userId;
    if (!user.isPublic && user.id !== userId) {
      return res.status(403).json({ error: "Ce profil n'est pas public" });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        watchlist: {
          select: {
            animeId: true,
            title: true,
            posterPath: true,
            anime: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
