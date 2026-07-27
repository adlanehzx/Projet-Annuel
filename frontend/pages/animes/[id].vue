<template>
  <div style="max-width:1060px;margin:0 auto;padding:28px 24px 48px">

    <div v-if="loading" style="text-align:center;padding:64px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="!anime" style="text-align:center;padding:64px;color:var(--color-accent-primary)">Anime introuvable</div>

    <template v-else>
      <div style="display:flex;gap:36px;align-items:flex-start">
        <div style="position:relative;width:220px;flex-shrink:0;aspect-ratio:2/3;border-radius:12px;overflow:hidden;background:var(--bg-elevated);border:1px solid var(--border)">
          <img v-if="anime.imageUrl" :src="anime.imageUrl" :alt="anime.title" style="width:100%;height:100%;object-fit:cover" />
          <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px">🎌</div>
          <div
            v-if="watchlistItem?.status === 'COMPLETED'"
            style="position:absolute;inset:0;pointer-events:none;z-index:1;background:rgba(0,0,0,0.28)"
          />
          <BrandSeal
            v-if="watchlistItem?.status === 'COMPLETED'"
            :size="84"
            format="png"
            style="position:absolute;right:12px;bottom:12px;z-index:2;transform:rotate(-8deg);opacity:0.9"
          />
        </div>

        <div style="flex:1;min-width:0">
          <h1 style="font-family:var(--font-display);font-weight:700;font-size:34px;margin:0 0 8px;color:var(--text-primary)">{{ anime.title }}</h1>
          <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)">{{ metaLine }}</div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <span
              v-for="item in anime.genres"
              :key="item.genre?.id ?? item"
              style="padding:4px 12px;border:1px solid var(--border);border-radius:999px;font-size:12px;font-weight:500;color:var(--text-secondary);background:var(--bg-elevated)"
            >{{ item.genre?.name ?? item }}</span>
          </div>

          <div style="display:flex;align-items:baseline;gap:10px;margin-top:20px">
            <span style="font-family:var(--font-display);font-weight:700;font-size:42px;line-height:1;color:var(--text-primary)">{{ anime.score?.toFixed(1) ?? '—' }}</span>
            <span style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)">/10 · Jikan score</span>
          </div>

          <div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;align-items:center;position:relative">
            <button
              @click="requireAuth(() => statusOpen = !statusOpen)"
              style="display:inline-flex;align-items:center;gap:10px;padding:12px 20px;background:var(--color-accent-primary);color:#fff;border:none;border-radius:8px;font-family:var(--font-body);font-weight:500;font-size:15px;cursor:pointer"
            >{{ ctaLabel }} <span style="font-size:11px">▾</span></button>
            <button
              @click="requireAuth(() => reviewOpen = !reviewOpen)"
              style="display:inline-flex;align-items:center;gap:8px;padding:11px 18px;background:var(--bg-input);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;font-family:var(--font-body);font-weight:500;font-size:14px;cursor:pointer"
            >☆ Noter</button>

            <Transition name="at-fade">
              <div v-if="statusOpen" style="position:absolute;left:0;top:54px;z-index:40;min-width:240px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,0.15)">
                <button v-for="opt in statusOpts" :key="opt.value" @click="pickStatus(opt.value)" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;background:none;border:none;border-radius:6px;font-family:var(--font-body);font-size:14px;color:var(--text-primary);cursor:pointer">
                  <span style="flex:1">{{ opt.label }}</span>
                  <BrandSeal v-if="watchlistItem?.status === opt.value" :size="18" format="svg" style="transform:rotate(-5deg)" />
                </button>
                <div style="height:1px;background:var(--border);margin:4px 8px"></div>
                <button v-if="watchlistItem" @click="removeFromWatchlist" style="display:block;width:100%;text-align:left;padding:10px 12px;background:none;border:none;border-radius:6px;font-family:var(--font-body);font-size:13px;color:var(--color-accent-primary);cursor:pointer">Retirer de ma watchlist</button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <p style="margin-top:26px;max-width:720px;font-size:15px;line-height:1.65;color:var(--text-secondary)">{{ anime.synopsis || 'Synopsis indisponible.' }}</p>

      <Transition name="at-fade">
        <ReviewForm
          v-if="reviewOpen"
          :model-value="myReview"
          :loading="reviewLoading"
          :error-message="reviewError"
          @submit="saveReview"
          @cancel="reviewOpen = false"
        />
      </Transition>

      <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin:36px 0 14px;color:var(--text-primary)">Reviews ({{ communityReviews.length }})</h2>
      <div style="display:flex;flex-direction:column;gap:12px;max-width:760px">
        <ReviewCard
          v-for="review in communityReviews"
          :key="review.id"
          :review="review"
          :loading-like="likeLoadingReviewId === review.id"
          @toggle-like="toggleLike"
        />
        <div v-if="communityReviews.length === 0" style="padding:28px;border:1px dashed var(--border);border-radius:10px;text-align:center;color:var(--text-secondary);font-size:14px">
          Aucune review pour l'instant.
          <button v-if="!reviewOpen" @click="requireAuth(() => reviewOpen = true)" style="margin-top:12px;display:block;margin-inline:auto;padding:8px 16px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:8px;font-size:13px;cursor:pointer">Écrire la première review</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWatchlist } from "../../composables/useWatchlist";
import { useAnimes } from "../../composables/useAnimes";
import { useReviews } from "../../composables/useReviews";
import { useAuth } from "../../composables/useAuth";
import { useAuthGuard } from "../../composables/useAuthGuard";
import { io } from "socket.io-client";

// Nuxt auto-imports these at runtime; declare them for TS when Nuxt types are unavailable.
declare const useRoute: () => any;
declare const useRuntimeConfig: any;
declare const useState: any;
declare const ref: any;
declare const computed: any;
declare const onMounted: any;
declare const onBeforeUnmount: any;

const route = useRoute();
const animeId = parseInt(route.params.id as string);

const { getAnimeDetails } = useAnimes();
const { fetchWatchlist, getWatchlistItem, addToWatchlist, updateStatus, removeFromWatchlist: removeWatchlistItem } = useWatchlist();
const { getReview, getMovieReviews, createOrUpdateReview, likeReview, unlikeReview } = useReviews();
const { isAuthenticated } = useAuth();
const { requireAuth } = useAuthGuard();
const runtimeConfig = useRuntimeConfig();

const anime = ref(null as any);
const loading = ref(true);
const statusOpen = ref(false);
const reviewOpen = ref(false);
const reviewLoading = ref(false);
const reviewError = ref("");
const myReview = ref({ id: null as number | null, rating: 7, comment: "" });
const communityReviews = ref([] as any[]);
const likeLoadingReviewId = ref(null as number | null);

let animeSocket: any = null;

const handleLikeUpdated = (payload: { reviewId: number; likesCount: number }) => {
  const idx = communityReviews.value.findIndex((r: any) => r.id === payload.reviewId);
  if (idx === -1) return;
  communityReviews.value[idx] = {
    ...communityReviews.value[idx],
    likesCount: payload.likesCount,
  };
};

onMounted(async () => {
  try {
    if (isAuthenticated.value) await fetchWatchlist();
    anime.value = await getAnimeDetails(animeId);
    const wi = watchlistItem.value;
    if (wi) {
      const rev = await getReview(wi.id);
      if (rev) myReview.value = rev;
      communityReviews.value = await getMovieReviews(wi.id);
    }

    const token = useState("auth.token", () => "").value;
    if (token) {
      const baseUrl = String(runtimeConfig.public.apiBase || "http://localhost:3001/api");
      const socketUrl = baseUrl.replace(/\/api\/?$/, "");

      animeSocket = io(socketUrl, {
        transports: ["websocket"],
        auth: { token },
      });

      animeSocket.on("connect", () => {
        animeSocket.emit("subscribe:anime", animeId);
      });

      animeSocket.on("review:like-updated", handleLikeUpdated);
    }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});

onBeforeUnmount(() => {
  if (animeSocket) {
    animeSocket.emit("unsubscribe:anime", animeId);
    animeSocket.off("review:like-updated", handleLikeUpdated);
    animeSocket.disconnect();
    animeSocket = null;
  }
});

const watchlistItem = computed(() => getWatchlistItem.value(animeId));

const metaLine = computed(() => {
  if (!anime.value) return "";
  const parts = [];
  if (anime.value.airedFrom) parts.push(new Date(anime.value.airedFrom).getFullYear());
  if (anime.value.episodes) parts.push(`${anime.value.episodes} épisodes`);
  if (anime.value.status) parts.push(anime.value.status);
  return parts.join(" · ");
});

const ctaLabel = computed(() => {
  if (!watchlistItem.value) return "+ Ajouter à ma watchlist";
  const labels: Record<string, string> = { TO_WATCH: "À voir", WATCHING: "En cours", COMPLETED: "Terminé", DROPPED: "Abandonné", ON_HOLD: "En pause" };
  return labels[watchlistItem.value.status] ?? watchlistItem.value.status;
});

const statusOpts = [
  { value: "TO_WATCH", label: "À voir" },
  { value: "WATCHING", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "DROPPED", label: "Abandonné" },
  { value: "ON_HOLD", label: "En pause" },
];

const pickStatus = async (status: string) => {
  statusOpen.value = false;
  try {
    if (watchlistItem.value) {
      await updateStatus(watchlistItem.value.id, status);
    } else {
      await addToWatchlist(animeId);
      if (status !== "TO_WATCH") {
        await fetchWatchlist();
        const wi = watchlistItem.value;
        if (wi) await updateStatus(wi.id, status);
      }
    }
    await fetchWatchlist();
  } catch (e) { console.error(e); }
};

const removeFromWatchlist = async () => {
  statusOpen.value = false;
  if (!watchlistItem.value) return;
  try { await removeWatchlistItem(watchlistItem.value.id); await fetchWatchlist(); }
  catch (e) { console.error(e); }
};

const saveReview = async (payload: {
  id: number | null;
  rating: number;
  comment: string;
}) => {
  try {
    reviewError.value = "";
    reviewLoading.value = true;

    // Une review est liée à une entrée watchlist: on crée l'entrée au besoin.
    let targetWatchlistItem = watchlistItem.value;
    if (!targetWatchlistItem) {
      await addToWatchlist(animeId);
      await fetchWatchlist();
      targetWatchlistItem = watchlistItem.value;
    }

    if (!targetWatchlistItem) {
      throw new Error("Impossible de créer l'entrée watchlist pour publier la review");
    }

    await createOrUpdateReview(
      targetWatchlistItem.id,
      payload.rating,
      payload.comment,
      payload.id || undefined,
    );
    myReview.value = {
      ...myReview.value,
      ...payload,
    };
    communityReviews.value = await getMovieReviews(targetWatchlistItem.id);
    reviewOpen.value = false;
  } catch (e: any) {
    reviewError.value = e.response?.data?.error || e.message || "Erreur lors de l'enregistrement";
    console.error(e);
  }
  finally { reviewLoading.value = false; }
};

const toggleLike = async (review: { id: number; likedByMe?: boolean }) => {
  await requireAuth(async () => {
    try {
      likeLoadingReviewId.value = review.id;
      const result = review.likedByMe
        ? await unlikeReview(review.id)
        : await likeReview(review.id);

      const idx = communityReviews.value.findIndex((r: any) => r.id === review.id);
      if (idx === -1) return;

      communityReviews.value[idx] = {
        ...communityReviews.value[idx],
        likesCount: result.likesCount,
        likedByMe: result.likedByMe,
      };
    } catch (e) {
      console.error(e);
    } finally {
      likeLoadingReviewId.value = null;
    }
  });
};
</script>

<style scoped>
.at-fade-enter-active, .at-fade-leave-active { transition: opacity 0.15s ease; }
.at-fade-enter-from, .at-fade-leave-to { opacity: 0; }
</style>
