-- Add fields used by anime catalogue filters
ALTER TABLE "animes"
ADD COLUMN "format" TEXT,
ADD COLUMN "studio" TEXT;

-- Add indexes for catalogue filtering
CREATE INDEX "animes_format_idx" ON "animes"("format");
CREATE INDEX "animes_studio_idx" ON "animes"("studio");
CREATE INDEX "animes_aired_from_idx" ON "animes"("aired_from");
