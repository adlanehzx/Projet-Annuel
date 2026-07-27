import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getCommunityTopAnimes } from "../services/recommendations.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const genreQuery =
      typeof req.query.genre === "string" ? req.query.genre.trim() : "";
    const studioQuery =
      typeof req.query.studio === "string" ? req.query.studio.trim() : "";
    const formatQuery =
      typeof req.query.format === "string" ? req.query.format.trim() : "";
    const yearQuery =
      typeof req.query.year === "string" ? req.query.year.trim() : "";
    const sortQuery =
      typeof req.query.sort === "string" ? req.query.sort.trim() : "score";

    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(String(req.query.limit ?? "40"), 10) || 40),
    );
    const skip = (page - 1) * limit;

    const andFilters: any[] = [];

    if (query) {
      andFilters.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { titleEnglish: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    if (genreQuery) {
      const genreTokens = genreQuery
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean);

      const genreIds = genreTokens
        .map((token) => Number.parseInt(token, 10))
        .filter((id) => !Number.isNaN(id));

      const genreNames = genreTokens.filter((token) => Number.isNaN(Number.parseInt(token, 10)));

      if (genreIds.length > 0 || genreNames.length > 0) {
        andFilters.push({
          OR: [
            genreIds.length > 0
              ? {
                  genres: {
                    some: {
                      genreId: { in: genreIds },
                    },
                  },
                }
              : undefined,
            genreNames.length > 0
              ? {
                  genres: {
                    some: {
                      genre: {
                        name: { in: genreNames, mode: "insensitive" },
                      },
                    },
                  },
                }
              : undefined,
          ].filter(Boolean),
        });
      }
    }

    if (studioQuery) {
      andFilters.push({
        studio: {
          contains: studioQuery,
          mode: "insensitive",
        },
      });
    }

    if (formatQuery) {
      andFilters.push({
        format: {
          equals: formatQuery,
          mode: "insensitive",
        },
      });
    }

    if (yearQuery) {
      const year = Number.parseInt(yearQuery, 10);
      if (!Number.isNaN(year) && year >= 1900 && year <= 2100) {
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
        andFilters.push({
          airedFrom: {
            gte: yearStart,
            lt: yearEnd,
          },
        });
      }
    }

    const where = andFilters.length > 0 ? { AND: andFilters } : undefined;

    const orderBy =
      sortQuery === "title"
        ? [{ title: "asc" as const }]
        : sortQuery === "rank"
          ? [{ rank: "asc" as const }, { score: "desc" as const }]
          : [{ score: "desc" as const }, { popularity: "asc" as const }];

    const [animes, total] = await Promise.all([
      prisma.anime.findMany({
        where,
        include: {
          genres: { include: { genre: true } },
        },
        orderBy,
        take: limit,
        skip,
      }),
      prisma.anime.count({ where }),
    ]);

    res.json({
      data: animes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      filters: {
        q: query || null,
        genre: genreQuery || null,
        year: yearQuery || null,
        studio: studioQuery || null,
        format: formatQuery || null,
        sort: sortQuery || null,
      },
    });
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

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [animes, users, reviews] = await Promise.all([
      prisma.anime.count(),
      prisma.user.count(),
      prisma.review.count(),
    ]);

    res.json({ animes, users, reviews });
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