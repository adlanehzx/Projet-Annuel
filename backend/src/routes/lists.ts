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

router.post("/:id/animes", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = parseId(req.params.id);
    const animeId = parseId(String(req.body.animeId));

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!id || !animeId) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) return res.status(404).json({ error: "Liste non trouvée" });
    if (list.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const anime = await prisma.anime.findUnique({ where: { id: animeId } });

    if (!anime) return res.status(404).json({ error: "Animé non trouvé" });

    const position = await prisma.listAnime.aggregate({
      where: { listId: id },
      _max: { position: true },
    });

    const listAnime = await prisma.listAnime.create({
      data: {
        listId: id,
        animeId,
        position: (position._max.position || 0) + 1,
      },
      include: { anime: true },
    });

    res.status(201).json(listAnime);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Cet animé est déjà dans la liste" });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/:id/animes/:animeId", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = parseId(req.params.id);
    const animeId = parseId(req.params.animeId);

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!id || !animeId) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) return res.status(404).json({ error: "Liste non trouvée" });
    if (list.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const listAnime = await prisma.listAnime.findUnique({
      where: {
        listId_animeId: {
          listId: id,
          animeId,
        },
      },
    });

    if (!listAnime) {
      return res.status(404).json({ error: "Animé absent de la liste" });
    }

    await prisma.listAnime.delete({ where: { id: listAnime.id } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/:id/reorder", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const id = parseId(req.params.id);
    const animeIds = req.body.animeIds;

    if (!userId) return res.status(401).json({ error: "Non authentifié" });
    if (!id) return res.status(400).json({ error: "Identifiant invalide" });
    if (!Array.isArray(animeIds) || animeIds.length === 0) {
      return res.status(400).json({ error: "La liste des animés est requise" });
    }

    const orderedAnimeIds = animeIds.map((animeId) => parseId(String(animeId)));

    if (orderedAnimeIds.some((animeId) => !animeId)) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }

    const uniqueAnimeIds = new Set(orderedAnimeIds);

    if (uniqueAnimeIds.size !== orderedAnimeIds.length) {
      return res.status(400).json({ error: "La liste contient des doublons" });
    }

    const list = await prisma.list.findUnique({ where: { id } });

    if (!list) return res.status(404).json({ error: "Liste non trouvée" });
    if (list.userId !== userId) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const existingItems = await prisma.listAnime.findMany({
      where: {
        listId: id,
        animeId: { in: orderedAnimeIds as number[] },
      },
      select: { animeId: true },
    });

    if (existingItems.length !== orderedAnimeIds.length) {
      return res.status(400).json({ error: "Certains animés ne sont pas dans la liste" });
    }

    await prisma.$transaction(
      (orderedAnimeIds as number[]).map((animeId, index) =>
        prisma.listAnime.update({
          where: {
            listId_animeId: {
              listId: id,
              animeId,
            },
          },
          data: { position: index + 1 },
        }),
      ),
    );

    const updated = await prisma.list.findUnique({
      where: { id },
      include: {
        animes: {
          include: { anime: true },
          orderBy: { position: "asc" },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;