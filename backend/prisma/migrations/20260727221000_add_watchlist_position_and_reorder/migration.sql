ALTER TABLE "Watchlist"
  ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Watchlist_userId_position_idx"
  ON "Watchlist"("userId", "position");

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" ASC) AS rn
  FROM "Watchlist"
)
UPDATE "Watchlist" w
SET "position" = ranked.rn
FROM ranked
WHERE w.id = ranked.id;
