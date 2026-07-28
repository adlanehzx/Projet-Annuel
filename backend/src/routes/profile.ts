import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { uploadAvatar, avatarsDir } from "../middleware/upload.js";

const prisma = new PrismaClient();
const router = Router();

const AVATAR_URL_PREFIX = "/uploads/avatars/";

// Supprime un ancien avatar uploadé localement (n'y touche pas si c'est une
// URL externe, ex. photo de profil Google/GitHub récupérée via OAuth)
const deleteLocalAvatarFile = (avatarUrl: string | null | undefined) => {
  if (!avatarUrl || !avatarUrl.startsWith(AVATAR_URL_PREFIX)) return;
  const filename = avatarUrl.slice(AVATAR_URL_PREFIX.length);
  const filePath = path.join(avatarsDir, filename);
  if (path.dirname(filePath) !== avatarsDir) return;
  fs.unlink(filePath, () => {});
};

// GET /api/profile/stats - statistiques de l'utilisateur connecté (dashboard profil)
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

// GET /api/profile/genres - répartition des genres de la watchlist de l'utilisateur connecté
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

// POST /api/profile/avatar - upload d'une nouvelle photo de profil
router.post("/avatar", (req: Request, res: Response) => {
  uploadAvatar.single("avatar")(req, res, async (err: any) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "L'image dépasse la taille maximale autorisée (5 Mo)"
          : err.message || "Fichier invalide";
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image fournie" });
    }

    try {
      const userId = req.userId!;
      const previous = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      const avatarUrl = `${AVATAR_URL_PREFIX}${req.file.filename}`;
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: { id: true, username: true, avatar: true },
      });

      deleteLocalAvatarFile(previous?.avatar);
      res.json(user);
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
});

// DELETE /api/profile/avatar - retire la photo de profil actuelle
router.delete("/avatar", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const previous = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: { id: true, username: true, avatar: true },
    });

    deleteLocalAvatarFile(previous?.avatar);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
