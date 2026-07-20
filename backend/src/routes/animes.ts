import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getCommunityTopAnimes } from "../services/recommendations.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const animes = await prisma.anime.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { titleEnglish: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        genres: { include: { genre: true } },
      },
      orderBy: [{ score: "desc" }, { popularity: "asc" }],
      take: 40,
    });

    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/top", async (_req: Request, res: Response) => {
  try {
    const topAnimes = await getCommunityTopAnimes();

    res.json(topAnimes);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const anime = await prisma.anime.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        genres: { include: { genre: true } },
      },
    });

    if (!anime) return res.status(404).json({ error: "Anime non trouvé" });

    res.json(anime);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;