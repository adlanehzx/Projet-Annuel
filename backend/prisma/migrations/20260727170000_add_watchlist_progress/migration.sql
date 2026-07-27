-- Add progression tracking for watchlist items
ALTER TABLE "Watchlist"
ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;
