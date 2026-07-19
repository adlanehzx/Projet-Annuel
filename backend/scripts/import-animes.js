import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "https://api.jikan.moe/v4/top/anime";
const PAGES_TO_FETCH = Number(process.env.JIKAN_PAGES ?? 5);
const DELAY_MS = Number(process.env.JIKAN_DELAY_MS ?? 1000);
const MAX_RETRIES = Number(process.env.JIKAN_MAX_RETRIES ?? 3);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildAnimeData(entry) {
  return {
    jikanId: entry.mal_id,
    title: entry.title,
    titleEnglish: entry.title_english ?? null,
    synopsis: entry.synopsis ?? null,
    imageUrl: entry.images?.jpg?.image_url ?? null,
    score: entry.score ?? null,
    rank: entry.rank ?? null,
    popularity: entry.popularity ?? null,
    episodes: entry.episodes ?? null,
    status: entry.status ?? null,
    airedFrom: toDate(entry.aired?.from),
    airedTo: toDate(entry.aired?.to),
    url: entry.url ?? null,
    genres: Array.isArray(entry.genres) ? entry.genres : [],
  };
}

async function fetchPage(page) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(`${BASE_URL}?page=${page}&limit=25`);

    if (response.ok) {
      return response.json();
    }

    if (attempt === MAX_RETRIES) {
      throw new Error(`Jikan request failed on page ${page} with status ${response.status}`);
    }

    await sleep(DELAY_MS * attempt);
  }
}

async function upsertGenresAndAnime(anime) {
  const { genres, ...animeData } = anime;
  const animeRecord = await prisma.anime.upsert({
    where: { jikanId: animeData.jikanId },
    create: animeData,
    update: animeData,
  });

  for (const genre of genres) {
    const genreRecord = await prisma.genre.upsert({
      where: { jikanId: genre.mal_id },
      create: {
        jikanId: genre.mal_id,
        name: genre.name,
        slug: genre.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      },
      update: {
        name: genre.name,
        slug: genre.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      },
    });

    await prisma.animeGenre.upsert({
      where: {
        animeId_genreId: {
          animeId: animeRecord.id,
          genreId: genreRecord.id,
        },
      },
      create: {
        animeId: animeRecord.id,
        genreId: genreRecord.id,
      },
      update: {},
    });
  }
}

async function main() {
  const existingCount = await prisma.anime.count();
  console.log(`Existing animes in database: ${existingCount}`);

  let imported = 0;

  for (let page = 1; page <= PAGES_TO_FETCH; page += 1) {
    const payload = await fetchPage(page);
    const results = Array.isArray(payload.data) ? payload.data : [];

    for (const entry of results) {
      const anime = buildAnimeData(entry);
      await upsertGenresAndAnime(anime);
      imported += 1;
    }

    if (page < PAGES_TO_FETCH) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`Imported or updated ${imported} anime entries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });