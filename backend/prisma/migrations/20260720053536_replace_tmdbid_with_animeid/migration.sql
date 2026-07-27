/*
  Warnings:

  - You are about to drop the column `tmdbId` on the `Watchlist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,anime_id]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `anime_id` to the `Watchlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Watchlist_tmdbId_key";

-- DropIndex
DROP INDEX "Watchlist_userId_tmdbId_key";

-- AlterTable
ALTER TABLE "Watchlist" DROP COLUMN "tmdbId",
ADD COLUMN     "anime_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Watchlist_anime_id_idx" ON "Watchlist"("anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_anime_id_key" ON "Watchlist"("userId", "anime_id");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
