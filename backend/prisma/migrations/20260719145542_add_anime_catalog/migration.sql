CREATE TYPE "WatchStatus" AS ENUM ('TO_WATCH', 'WATCHING', 'COMPLETED');

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "avatar" TEXT,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "githubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OAuthProvider" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthProvider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Watchlist" (
    "id" SERIAL NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "status" "WatchStatus" NOT NULL DEFAULT 'TO_WATCH',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "userId" INTEGER NOT NULL,
    "watchlistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CollectionItem" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "collectionId" INTEGER NOT NULL,
    "watchlistId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "list_animes" (
    "id" SERIAL NOT NULL,
    "list_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "list_animes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "animes" (
    "id" SERIAL NOT NULL,
    "jikan_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_english" TEXT,
    "synopsis" TEXT,
    "image_url" TEXT,
    "score" DOUBLE PRECISION,
    "rank" INTEGER,
    "popularity" INTEGER,
    "episodes" INTEGER,
    "status" TEXT,
    "aired_from" TIMESTAMP(3),
    "aired_to" TIMESTAMP(3),
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "jikan_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "anime_genres" (
    "id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "anime_genres_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

CREATE INDEX "OAuthProvider_userId_idx" ON "OAuthProvider"("userId");

CREATE UNIQUE INDEX "OAuthProvider_provider_userId_key" ON "OAuthProvider"("provider", "userId");

CREATE UNIQUE INDEX "Watchlist_tmdbId_key" ON "Watchlist"("tmdbId");

CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

CREATE UNIQUE INDEX "Watchlist_userId_tmdbId_key" ON "Watchlist"("userId", "tmdbId");

CREATE INDEX "Review_userId_idx" ON "Review"("userId");

CREATE INDEX "Review_watchlistId_idx" ON "Review"("watchlistId");

CREATE UNIQUE INDEX "Review_userId_watchlistId_key" ON "Review"("userId", "watchlistId");

CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

CREATE INDEX "CollectionItem_collectionId_idx" ON "CollectionItem"("collectionId");

CREATE INDEX "CollectionItem_watchlistId_idx" ON "CollectionItem"("watchlistId");

CREATE UNIQUE INDEX "CollectionItem_collectionId_watchlistId_key" ON "CollectionItem"("collectionId", "watchlistId");

CREATE INDEX "lists_user_id_idx" ON "lists"("user_id");

CREATE INDEX "lists_is_public_idx" ON "lists"("is_public");

CREATE INDEX "lists_created_at_idx" ON "lists"("created_at");

CREATE INDEX "list_animes_list_id_idx" ON "list_animes"("list_id");

CREATE INDEX "list_animes_anime_id_idx" ON "list_animes"("anime_id");

CREATE INDEX "list_animes_list_id_position_idx" ON "list_animes"("list_id", "position");

CREATE UNIQUE INDEX "list_animes_list_id_anime_id_key" ON "list_animes"("list_id", "anime_id");

CREATE UNIQUE INDEX "animes_jikan_id_key" ON "animes"("jikan_id");

CREATE INDEX "animes_score_idx" ON "animes"("score");

CREATE INDEX "animes_rank_idx" ON "animes"("rank");

CREATE INDEX "animes_popularity_idx" ON "animes"("popularity");

CREATE INDEX "animes_title_idx" ON "animes"("title");

CREATE UNIQUE INDEX "genres_jikan_id_key" ON "genres"("jikan_id");

CREATE INDEX "genres_name_idx" ON "genres"("name");

CREATE INDEX "anime_genres_anime_id_idx" ON "anime_genres"("anime_id");

CREATE INDEX "anime_genres_genre_id_idx" ON "anime_genres"("genre_id");

CREATE UNIQUE INDEX "anime_genres_anime_id_genre_id_key" ON "anime_genres"("anime_id", "genre_id");

ALTER TABLE "OAuthProvider" ADD CONSTRAINT "OAuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "list_animes" ADD CONSTRAINT "list_animes_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "list_animes" ADD CONSTRAINT "list_animes_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "animes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
