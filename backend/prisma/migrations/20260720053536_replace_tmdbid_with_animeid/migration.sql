DROP INDEX "Watchlist_tmdbId_key";

DROP INDEX "Watchlist_userId_tmdbId_key";

ALTER TABLE "Watchlist" DROP COLUMN "tmdbId",
ADD COLUMN     "anime_id" INTEGER NOT NULL;

CREATE INDEX "Watchlist_anime_id_idx" ON "Watchlist"("anime_id");

CREATE UNIQUE INDEX "Watchlist_userId_anime_id_key" ON "Watchlist"("userId", "anime_id");

ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
