-- Convert existing DROPPED entries, then remove the enum value.
UPDATE "Watchlist" SET status = 'ON_HOLD' WHERE status = 'DROPPED';

ALTER TYPE "WatchStatus" RENAME TO "WatchStatus_old";

CREATE TYPE "WatchStatus" AS ENUM ('TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD');

ALTER TABLE "Watchlist" ALTER COLUMN status DROP DEFAULT;

ALTER TABLE "Watchlist"
  ALTER COLUMN status TYPE "WatchStatus"
  USING status::text::"WatchStatus";

ALTER TABLE "Watchlist" ALTER COLUMN status SET DEFAULT 'TO_WATCH'::"WatchStatus";

DROP TYPE "WatchStatus_old";
