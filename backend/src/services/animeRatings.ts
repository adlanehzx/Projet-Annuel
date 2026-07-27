import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

export const recalculateAnimeRatingByWatchlistId = async (watchlistId: number) => {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
    select: { animeId: true },
  });

  if (!watchlist) return null;

  const aggregate = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { _all: true },
    where: {
      watchlist: {
        animeId: watchlist.animeId,
      },
    },
  });

  const averageRating =
    aggregate._avg.rating == null ? null : roundToTwoDecimals(aggregate._avg.rating);

  const updatedAnime = await prisma.anime.update({
    where: { id: watchlist.animeId },
    data: {
      communityRating: averageRating,
      communityReviewCount: aggregate._count._all,
    },
    select: {
      id: true,
      communityRating: true,
      communityReviewCount: true,
    },
  });

  return updatedAnime;
};