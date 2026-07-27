import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface UserStatistics {
  totalAnimesWatched: number;
  totalEpisodesWatched: number;
  totalDaysWatched: number;
  averageRating: number;
  genreDistribution: { genre: string; count: number }[];
  recommendations: any[];
}

export const getUserStatistics = async (
  userId: number,
): Promise<UserStatistics> => {
  const completedCount = await prisma.watchlist.count({
    where: {
      userId,
      status: "COMPLETED",
    },
  });
  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { rating: true },
  });

  const totalWatchlist = await prisma.watchlist.count({
    where: { userId },
  });
  const stats: UserStatistics = {
    totalAnimesWatched: completedCount,
    totalEpisodesWatched: 0, // Nécessite des données d'épisodes dans la DB
    totalDaysWatched: 0, // Nécessite des données de durée dans la DB
    averageRating:
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
    genreDistribution: [], // Nécessite des données de genre dans la DB (TMDB API)
    recommendations: [],
  };

  return stats;
};

export const getBasicStatistics = async (userId: number) => {
  const completedAnimes = await prisma.watchlist.count({
    where: { userId, status: "COMPLETED" },
  });

  const watchingAnimes = await prisma.watchlist.count({
    where: { userId, status: "WATCHING" },
  });

  const toWatchAnimes = await prisma.watchlist.count({
    where: { userId, status: "TO_WATCH" },
  });

  const droppedAnimes = await prisma.watchlist.count({
    where: { userId, status: "DROPPED" },
  });

  const onHoldAnimes = await prisma.watchlist.count({
    where: { userId, status: "ON_HOLD" },
  });

  const reviews = await prisma.review.findMany({
    where: { userId },
    select: { rating: true },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const collections = await prisma.collection.count({
    where: { userId },
  });

  return {
    watchlist: {
      completed: completedAnimes,
      watching: watchingAnimes,
      toWatch: toWatchAnimes,
      dropped: droppedAnimes,
      onHold: onHoldAnimes,
      total:
        completedAnimes +
        watchingAnimes +
        toWatchAnimes +
        droppedAnimes +
        onHoldAnimes,
    },
    reviews: {
      total: reviews.length,
      averageRating: Math.round(averageRating * 100) / 100,
    },
    collections,
  };
};

export const getTopGenres = async (userId: number) => {
  const watchlistItems = await prisma.watchlist.findMany({
    where: { userId },
    select: {
      anime: {
        select: {
          genres: {
            select: {
              genre: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  const counts: Record<string, number> = {};

  watchlistItems.forEach((item) => {
    item.anime.genres.forEach((animeGenre) => {
      const name = animeGenre.genre.name;
      counts[name] = (counts[name] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};
export const getAdvancedStatistics = async (userId: number) => {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      reviews: {
        where: { userId },
        select: { rating: true, createdAt: true },
      },
    },
  });

  const allReviews = await prisma.review.findMany({
    where: { userId },
    include: {
      watchlist: {
        select: { title: true, animeId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const completedCount = watchlist.filter(
    (w) => w.status === "COMPLETED",
  ).length;
  const watchingCount = watchlist.filter((w) => w.status === "WATCHING").length;
  const toWatchCount = watchlist.filter((w) => w.status === "TO_WATCH").length;
  const ratedItems = watchlist.filter((w) => w.reviews.length > 0);
  const allRatings = ratedItems.flatMap((w) => w.reviews.map((r) => r.rating));
  const averageRating =
    allRatings.length > 0
      ? Math.round(
          (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 100,
        ) / 100
      : 0;
  const topRated = ratedItems
    .map((w) => ({
      title: w.title,
      animeId: w.animeId,
      rating: w.reviews[0]?.rating ?? 0,
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
  const worstRated = ratedItems
    .map((w) => ({
      title: w.title,
      animeId: w.animeId,
      rating: w.reviews[0]?.rating ?? 0,
    }))
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5);
  const ratingDistribution = {
    "10": allRatings.filter((r) => r === 10).length,
    "9": allRatings.filter((r) => r === 9).length,
    "8": allRatings.filter((r) => r === 8).length,
    "7": allRatings.filter((r) => r === 7).length,
    "6": allRatings.filter((r) => r === 6).length,
    "5": allRatings.filter((r) => r === 5).length,
    "4": allRatings.filter((r) => r === 4).length,
    "3": allRatings.filter((r) => r === 3).length,
    "2": allRatings.filter((r) => r === 2).length,
    "1": allRatings.filter((r) => r === 1).length,
  };
  const reviewsByMonth = allReviews.reduce(
    (acc, review) => {
      const date = new Date(review.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    summary: {
      totalAnimesInWatchlist: watchlist.length,
      completed: completedCount,
      watching: watchingCount,
      toWatch: toWatchCount,
      totalReviews: allReviews.length,
      averageRating,
    },
    ratings: {
      distribution: ratingDistribution,
      topRated,
      worstRated,
    },
    timeline: {
      reviewsByMonth,
    },
  };
};
export const getRecommendations = async (userId: number) => {
  const topRatedAnimes = await prisma.watchlist.findMany({
    where: {
      userId,
      reviews: {
        some: {
          userId,
          rating: {
            gte: 8, // Notes >= 8
          },
        },
      },
    },
    include: {
      reviews: {
        where: { userId },
        select: { rating: true },
      },
    },
    take: 10,
  });
  const recommendations = topRatedAnimes.map((anime) => ({
    based_on_title: anime.title,
    based_on_rating: anime.reviews[0]?.rating,
    animeId: anime.animeId,
    message: "Les animes similaires à celui-ci pourraient vous plaire",
  }));

  return {
    message: "Pour des recommandations plus précises, intégrez l'API TMDB",
    similarTo: recommendations,
    note: "Cette fonctionnalité nécessite une intégration avec l'API TMDB pour analyser les genres",
  };
};
