import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AnimeResult = {
  id: number;
  jikanId: number;
  title: string;
  titleEnglish: string | null;
  synopsis: string | null;
  imageUrl: string | null;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  episodes: number | null;
  status: string | null;
  averageRating: number | null;
  reviewCount: number;
  genres: string[];
};

export const getPersonalRecommendations = async (userId: number) => {
  return prisma.$queryRaw<AnimeResult[]>`
    WITH liked_genres AS (
      SELECT DISTINCT ag.genre_id
      FROM "Review" r
      JOIN "Watchlist" w ON w.id = r."watchlistId"
      JOIN animes liked ON liked.id = w."anime_id"
      JOIN anime_genres ag ON ag.anime_id = liked.id
      WHERE r."userId" = ${userId}
        AND r.rating >= 7
    ),
    community_ratings AS (
      SELECT
        a.id AS anime_id,
        AVG(r.rating)::float AS average_rating,
        COUNT(r.id)::int AS review_count
      FROM animes a
      LEFT JOIN "Watchlist" w ON w."anime_id" = a.id
      LEFT JOIN "Review" r ON r."watchlistId" = w.id
      GROUP BY a.id
    )
    SELECT
      a.id,
      a.jikan_id AS "jikanId",
      a.title,
      a.title_english AS "titleEnglish",
      a.synopsis,
      a.image_url AS "imageUrl",
      a.score,
      a.rank,
      a.popularity,
      a.episodes,
      a.status,
      cr.average_rating AS "averageRating",
      cr.review_count AS "reviewCount",
      COALESCE(array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL), '{}') AS genres
    FROM animes a
    JOIN anime_genres ag ON ag.anime_id = a.id
    JOIN liked_genres lg ON lg.genre_id = ag.genre_id
    JOIN genres g ON g.id = ag.genre_id
    LEFT JOIN community_ratings cr ON cr.anime_id = a.id
    WHERE NOT EXISTS (
      SELECT 1
      FROM "Watchlist" user_watchlist
      WHERE user_watchlist."userId" = ${userId}
        AND user_watchlist."anime_id" = a.id
    )
    GROUP BY
      a.id,
      a.jikan_id,
      a.title,
      a.title_english,
      a.synopsis,
      a.image_url,
      a.score,
      a.rank,
      a.popularity,
      a.episodes,
      a.status,
      cr.average_rating,
      cr.review_count
    ORDER BY cr.average_rating DESC NULLS LAST, a.score DESC NULLS LAST, a.popularity ASC NULLS LAST
    LIMIT 20
  `;
};

export const getCommunityTopAnimes = async () => {
  return prisma.$queryRaw<AnimeResult[]>`
    SELECT
      a.id,
      a.jikan_id AS "jikanId",
      a.title,
      a.title_english AS "titleEnglish",
      a.synopsis,
      a.image_url AS "imageUrl",
      a.score,
      a.rank,
      a.popularity,
      a.episodes,
      a.status,
      AVG(r.rating)::float AS "averageRating",
      COUNT(r.id)::int AS "reviewCount",
      COALESCE(array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL), '{}') AS genres
    FROM animes a
    JOIN "Watchlist" w ON w."anime_id" = a.id
    JOIN "Review" r ON r."watchlistId" = w.id
    LEFT JOIN anime_genres ag ON ag.anime_id = a.id
    LEFT JOIN genres g ON g.id = ag.genre_id
    GROUP BY
      a.id,
      a.jikan_id,
      a.title,
      a.title_english,
      a.synopsis,
      a.image_url,
      a.score,
      a.rank,
      a.popularity,
      a.episodes,
      a.status
    HAVING AVG(r.rating) >= 7
      AND COUNT(r.id) >= 5
    ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC, a.score DESC NULLS LAST
    LIMIT 20
  `;
};