import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const lists = await prisma.list.findMany({
      where: { userId },
      include: {
        animes: {
          include: { anime: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = parseId(req.params.id);

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!id) return res.status(400).json({ error: "Identifiant invalide" });

    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        animes: {
          include: { anime: true },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!list) return res.status(404).json({ error: "Liste non trouvée" });
    if (list.userId !== userId && !list.isPublic) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { title, description, isPublic } = req.body;

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Le titre est requis" });
    }

    const list = await prisma.list.create({
      data: {
        userId,
        title: title.trim(),
        description: description || null,
        isPublic: Boolean(isPublic),
      },
    });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = parseId(req.params.id);
    const { title, description, isPublic } = req.body;

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!id) return res.status(400).json({ error: "Identifiant invalide" });

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) return res.status(404).json({ error: "Liste non trouvée" });
    if (list.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const updated = await prisma.list.update({
      where: { id },
      data: {
        title: typeof title === "string" ? title.trim() : undefined,
        description: description === undefined ? undefined : description || null,
        isPublic: typeof isPublic === "boolean" ? isPublic : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = parseId(req.params.id);

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!id) return res.status(400).json({ error: "Identifiant invalide" });

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) return res.status(404).json({ error: "Liste non trouvée" });
    if (list.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await prisma.list.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;