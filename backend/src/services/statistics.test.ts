import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getBasicStatistics,
  getTopGenres,
  getAdvancedStatistics,
  getRecommendations,
} from "./statistics.js";

const mockPrisma = {
  watchlist: { count: vi.fn(), findMany: vi.fn() },
  review: { findMany: vi.fn() },
  collection: { count: vi.fn() },
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getBasicStatistics", () => {
  it("agrège le nombre d'animés par statut, la note moyenne et le nombre de collections", async () => {
    mockPrisma.watchlist.count.mockImplementation(({ where }: any) => {
      const byStatus: Record<string, number> = {
        COMPLETED: 3,
        WATCHING: 2,
        TO_WATCH: 5,
        ON_HOLD: 1,
      };
      return Promise.resolve(byStatus[where.status] ?? 0);
    });
    mockPrisma.review.findMany.mockResolvedValue([{ rating: 8 }, { rating: 6 }]);
    mockPrisma.collection.count.mockResolvedValue(4);

    const stats = await getBasicStatistics(1);

    expect(stats.watchlist).toEqual({
      completed: 3,
      watching: 2,
      toWatch: 5,
      onHold: 1,
      total: 11,
    });
    expect(stats.reviews).toEqual({ total: 2, averageRating: 7 });
    expect(stats.collections).toBe(4);
  });

  it("renvoie une moyenne de 0 quand l'utilisateur n'a aucune review", async () => {
    mockPrisma.watchlist.count.mockResolvedValue(0);
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.collection.count.mockResolvedValue(0);

    const stats = await getBasicStatistics(1);

    expect(stats.reviews).toEqual({ total: 0, averageRating: 0 });
  });
});

describe("getTopGenres", () => {
  it("compte les genres de la watchlist et retourne les 10 plus fréquents, triés par popularité", async () => {
    const makeItem = (genreNames: string[]) => ({
      anime: { genres: genreNames.map((name) => ({ genre: { name } })) },
    });

    mockPrisma.watchlist.findMany.mockResolvedValue([
      makeItem(["Action", "Shonen"]),
      makeItem(["Action"]),
      makeItem(["Action", "Comedy"]),
      makeItem(["Shonen"]),
    ]);

    const result = await getTopGenres(1);

    expect(result[0]).toEqual({ name: "Action", count: 3 });
    expect(result[1]).toEqual({ name: "Shonen", count: 2 });
    expect(result).toContainEqual({ name: "Comedy", count: 1 });
    expect(result).toHaveLength(3);
  });

  it("limite le résultat aux 10 genres les plus populaires", async () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      anime: { genres: [{ genre: { name: `Genre${i}` } }] },
    }));
    mockPrisma.watchlist.findMany.mockResolvedValue(items);

    const result = await getTopGenres(1);

    expect(result).toHaveLength(10);
  });
});

describe("getAdvancedStatistics", () => {
  it("calcule le résumé, la distribution des notes et les tops/flops", async () => {
    mockPrisma.watchlist.findMany.mockResolvedValue([
      { status: "COMPLETED", title: "Naruto", animeId: 1, reviews: [{ rating: 9 }] },
      { status: "COMPLETED", title: "Bleach", animeId: 2, reviews: [{ rating: 3 }] },
      { status: "WATCHING", title: "One Piece", animeId: 3, reviews: [] },
      { status: "TO_WATCH", title: "AOT", animeId: 4, reviews: [] },
    ]);
    mockPrisma.review.findMany.mockResolvedValue([
      { createdAt: new Date("2026-01-15") },
      { createdAt: new Date("2026-01-20") },
      { createdAt: new Date("2026-02-01") },
    ]);

    const stats = await getAdvancedStatistics(1);

    expect(stats.summary).toEqual({
      totalAnimesInWatchlist: 4,
      completed: 2,
      watching: 1,
      toWatch: 1,
      totalReviews: 3,
      averageRating: 6,
    });
    expect(stats.ratings.distribution["9"]).toBe(1);
    expect(stats.ratings.distribution["3"]).toBe(1);
    expect(stats.ratings.topRated[0]).toEqual({ title: "Naruto", animeId: 1, rating: 9 });
    expect(stats.ratings.worstRated[0]).toEqual({ title: "Bleach", animeId: 2, rating: 3 });
    expect(stats.timeline.reviewsByMonth).toEqual({ "2026-01": 2, "2026-02": 1 });
  });
});

describe("getRecommendations", () => {
  it("suggère des animés basés sur les watchlist notées 8 ou plus", async () => {
    mockPrisma.watchlist.findMany.mockResolvedValue([
      { title: "Naruto", animeId: 1, reviews: [{ rating: 9 }] },
    ]);

    const result = await getRecommendations(1);

    expect(result.similarTo).toEqual([
      {
        based_on_title: "Naruto",
        based_on_rating: 9,
        animeId: 1,
        message: "Les animés similaires à celui-ci pourraient vous plaire",
      },
    ]);
  });
});
