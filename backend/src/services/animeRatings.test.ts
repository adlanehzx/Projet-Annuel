import { describe, it, expect, vi, beforeEach } from "vitest";
import { recalculateAnimeRatingByWatchlistId } from "./animeRatings.js";

const mockPrisma = {
  watchlist: { findUnique: vi.fn() },
  review: { aggregate: vi.fn() },
  anime: { update: vi.fn() },
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("recalculateAnimeRatingByWatchlistId", () => {
  it("retourne null si l'entrée de watchlist n'existe pas", async () => {
    mockPrisma.watchlist.findUnique.mockResolvedValue(null);

    const result = await recalculateAnimeRatingByWatchlistId(999);

    expect(result).toBeNull();
    expect(mockPrisma.review.aggregate).not.toHaveBeenCalled();
    expect(mockPrisma.anime.update).not.toHaveBeenCalled();
  });

  it("arrondit la moyenne des notes à deux décimales", async () => {
    mockPrisma.watchlist.findUnique.mockResolvedValue({ animeId: 7 });
    mockPrisma.review.aggregate.mockResolvedValue({
      _avg: { rating: 7.4555 },
      _count: { _all: 9 },
    });
    mockPrisma.anime.update.mockResolvedValue({
      id: 7,
      communityRating: 7.46,
      communityReviewCount: 9,
    });

    const result = await recalculateAnimeRatingByWatchlistId(1);

    expect(mockPrisma.anime.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { communityRating: 7.46, communityReviewCount: 9 },
      select: { id: true, communityRating: true, communityReviewCount: true },
    });
    expect(result).toEqual({ id: 7, communityRating: 7.46, communityReviewCount: 9 });
  });

  it("laisse communityRating à null quand il n'y a aucune review", async () => {
    mockPrisma.watchlist.findUnique.mockResolvedValue({ animeId: 3 });
    mockPrisma.review.aggregate.mockResolvedValue({
      _avg: { rating: null },
      _count: { _all: 0 },
    });
    mockPrisma.anime.update.mockResolvedValue({
      id: 3,
      communityRating: null,
      communityReviewCount: 0,
    });

    await recalculateAnimeRatingByWatchlistId(1);

    expect(mockPrisma.anime.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { communityRating: null, communityReviewCount: 0 } }),
    );
  });
});
