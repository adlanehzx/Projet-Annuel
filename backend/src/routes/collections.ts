import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET mes collections
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        items: { include: { watchlist: true }, orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET détail d'une collection
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { watchlist: true }, orderBy: { order: "asc" } },
      },
    });

    if (!collection) return res.status(404).json({ error: "Non trouvée" });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST créer une collection
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const { name, description, isPublic } = req.body;

    if (!name) return res.status(400).json({ error: "Le nom est requis" });

    const collection = await prisma.collection.create({
      data: {
        name,
        description: description || null,
        isPublic: isPublic || false,
        userId,
      },
    });

    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT mettre à jour une collection
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description, isPublic } = req.body;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.collection.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, isPublic },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST ajouter un film à une collection
router.post("/:collectionId/items", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { watchlistId, order } = req.body;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(req.params.collectionId) },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const item = await prisma.collectionItem.create({
      data: {
        collectionId: parseInt(req.params.collectionId),
        watchlistId,
        order: order || 0,
      },
      include: { watchlist: true },
    });

    res.status(201).json(item);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Ce film est déjà dans la collection" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE supprimer un film d'une collection
router.delete(
  "/:collectionId/items/:itemId",
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      const collection = await prisma.collection.findUnique({
        where: { id: parseInt(req.params.collectionId) },
      });

      if (!collection || collection.userId !== userId) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      await prisma.collectionItem.delete({
        where: { id: parseInt(req.params.itemId) },
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

// DELETE supprimer une collection
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!collection || collection.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await prisma.collection.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
