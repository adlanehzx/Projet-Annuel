import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { emitToUser } from "../realtime/socket.js";

const prisma = new PrismaClient();
const router = Router();

const ALLOWED_WATCH_STATUSES = [
  "TO_WATCH",
  "WATCHING",
  "COMPLETED",
  "ON_HOLD",
] as const;

const isAllowedWatchStatus = (status: unknown): status is (typeof ALLOWED_WATCH_STATUSES)[number] =>
  typeof status === "string" &&
  (ALLOWED_WATCH_STATUSES as readonly string[]).includes(status);
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: { anime: true, reviews: true, inCollections: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/status/:status", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const status = req.params.status.toUpperCase();
    if (!isAllowedWatchStatus(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }
    const watchlist = await prisma.watchlist.findMany({
      where: { userId, status: status as any },
      include: { anime: true, reviews: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await prisma.watchlist.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        anime: true,
        reviews: { include: { user: { select: { username: true } } } },
      },
    });

    if (!item) return res.status(404).json({ error: "Non trouvé" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const { animeId, status } = req.body;

    if (!animeId) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    if (status !== undefined && !isAllowedWatchStatus(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const anime = await prisma.anime.findUnique({
      where: { id: Number(animeId) },
    });

    if (!anime) return res.status(404).json({ error: "Animé non trouvé" });

    const latestPosition = await prisma.watchlist.aggregate({
      where: { userId },
      _max: { position: true },
    });

    const watchlist = await prisma.watchlist.create({
      data: {
        animeId: anime.id,
        title: anime.title,
        posterPath: anime.imageUrl,
        position: (latestPosition._max.position || 0) + 1,
        status: status || "TO_WATCH",
        userId,
      },
      include: { anime: true },
    });

    emitToUser(userId, "watchlist:changed", {
      action: "created",
      item: watchlist,
    });

    res.status(201).json(watchlist);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Cet animé est déjà dans votre watchlist" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/reorder", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const watchlistIds = req.body?.watchlistIds;

    if (!Array.isArray(watchlistIds) || watchlistIds.length === 0) {
      return res.status(400).json({ error: "La liste des IDs est requise" });
    }

    const orderedIds = watchlistIds
      .map((id) => Number.parseInt(String(id), 10))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (orderedIds.length !== watchlistIds.length) {
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    const uniqueIds = new Set(orderedIds);
    if (uniqueIds.size !== orderedIds.length) {
      return res.status(400).json({ error: "Doublons détectés" });
    }

    const existing = await prisma.watchlist.findMany({
      where: {
        userId,
        id: { in: orderedIds },
      },
      select: { id: true },
    });

    if (existing.length !== orderedIds.length) {
      return res.status(400).json({ error: "Certains éléments sont introuvables" });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.watchlist.update({
          where: { id },
          data: { position: index + 1 },
        }),
      ),
    );

    emitToUser(userId, "watchlist:changed", {
      action: "reordered",
      watchlistIds: orderedIds,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status } = req.body;

    if (!isAllowedWatchStatus(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const item = await prisma.watchlist.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { anime: { select: { episodes: true } } },
    });

    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const totalEpisodes = item.anime?.episodes;
    const data: { status: any; progress?: number } = { status };

    if (typeof totalEpisodes === "number" && totalEpisodes > 0) {
      if (status === "TO_WATCH") {
        data.progress = 0;
      } else if (status === "COMPLETED") {
        data.progress = totalEpisodes;
      } else if (status === "WATCHING") {
        data.progress = Math.round(totalEpisodes / 2);
      }
    }

    const updated = await prisma.watchlist.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { anime: true, reviews: true, inCollections: true },
    });

    emitToUser(userId, "watchlist:changed", {
      action: "status-updated",
      item: updated,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id/progress", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const watchlistId = parseInt(req.params.id);
    const progress = Number(req.body?.progress);

    if (Number.isNaN(watchlistId)) {
      return res.status(400).json({ error: "ID invalide" });
    }

    if (!Number.isInteger(progress) || progress < 0) {
      return res
        .status(400)
        .json({ error: "La progression doit être un entier positif" });
    }

    const item = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
      include: { anime: { select: { episodes: true } } },
    });

    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const totalEpisodes = item.anime?.episodes;
    const boundedProgress =
      typeof totalEpisodes === "number" && totalEpisodes > 0
        ? Math.min(progress, totalEpisodes)
        : progress;

    let nextStatus = item.status;
    if (typeof totalEpisodes === "number" && totalEpisodes > 0) {
      if (boundedProgress >= totalEpisodes) {
        nextStatus = "COMPLETED";
      } else if (boundedProgress > 0 && item.status === "TO_WATCH") {
        nextStatus = "WATCHING";
      }
    }

    const updated = await prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        progress: boundedProgress,
        status: nextStatus,
      },
      include: { anime: true, reviews: true, inCollections: true },
    });

    emitToUser(userId, "watchlist:changed", {
      action: "progress-updated",
      item: updated,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const item = await prisma.watchlist.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await prisma.watchlist.delete({ where: { id: parseInt(req.params.id) } });
    emitToUser(userId, "watchlist:changed", {
      action: "deleted",
      itemId: item.id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
