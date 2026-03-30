import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET watchlist de l'utilisateur
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: { reviews: true, inCollections: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET watchlist filtrée par status
router.get("/status/:status", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const status = req.params.status.toUpperCase();
    const watchlist = await prisma.watchlist.findMany({
      where: { userId, status: status as any },
      include: { reviews: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET détail d'une watchlist item
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await prisma.watchlist.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        reviews: { include: { user: { select: { username: true } } } },
      },
    });

    if (!item) return res.status(404).json({ error: "Non trouvé" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST ajouter un film à la watchlist
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const { tmdbId, title, posterPath, status } = req.body;

    if (!tmdbId || !title) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        tmdbId,
        title,
        posterPath: posterPath || null,
        status: status || "TO_WATCH",
        userId,
      },
    });

    res.status(201).json(watchlist);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Ce film est déjà dans votre watchlist" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT mettre à jour le status
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status } = req.body;

    const item = await prisma.watchlist.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.watchlist.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE supprimer de la watchlist
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
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
