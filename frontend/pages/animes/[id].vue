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
        <div v-if="reviewOpen" style="margin-top:28px;max-width:760px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:20px">
          <h3 style="font-family:var(--font-display);font-weight:700;font-size:18px;margin:0 0 14px;color:var(--text-primary)">{{ myReview.id ? 'Mon avis' : 'Écrire un avis' }}</h3>
          <div style="margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px">
              <input v-model.number="myReview.rating" type="range" min="0" max="10" step="0.5" style="flex:1;accent-color:var(--color-accent-primary)" />
              <span style="font-family:var(--font-display);font-weight:700;font-size:24px;color:var(--color-accent-primary);width:40px;text-align:right">{{ myReview.rating }}</span>
            </div>
          </div>
          <textarea v-model="myReview.comment" placeholder="Qu'en as-tu pensé ?" style="width:100%;height:100px;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-family:var(--font-body);font-size:14px;color:var(--text-primary);resize:none;outline:none;box-sizing:border-box"></textarea>
          <div style="display:flex;gap:10px;margin-top:12px">
            <button @click="saveReview" :disabled="reviewLoading" style="padding:10px 20px;background:var(--color-accent-primary);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer">{{ reviewLoading ? 'Enregistrement…' : (myReview.id ? 'Mettre à jour' : 'Publier') }}</button>
            <button @click="reviewOpen = false" style="padding:10px 16px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:8px;font-size:14px;cursor:pointer">Annuler</button>
          </div>
        </div>
      </Transition>

      <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin:36px 0 14px;color:var(--text-primary)">Reviews ({{ communityReviews.length }})</h2>
      <div style="display:flex;flex-direction:column;gap:12px;max-width:760px">
        <div v-for="review in communityReviews" :key="review.id" style="display:flex;gap:12px;padding:16px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--color-accent-secondary);color:#fff;font-family:var(--font-display);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">{{ (review.user?.username || '?').slice(0,2).toUpperCase() }}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span style="font-weight:500;font-size:14px;color:var(--text-primary)">{{ review.user?.username || 'Anonyme' }}</span>
              <span style="font-family:var(--font-mono);font-size:13px;color:var(--color-accent-primary)">★ {{ review.rating }}/10</span>
            </div>
            <div style="margin-top:6px;font-size:14px;line-height:1.55;color:var(--text-secondary)">{{ review.comment || 'Aucun commentaire.' }}</div>
          </div>
        </div>
        <div v-if="communityReviews.length === 0" style="padding:28px;border:1px dashed var(--border);border-radius:10px;text-align:center;color:var(--text-secondary);font-size:14px">
          Aucune review pour l'instant.
          <button v-if="!reviewOpen" @click="requireAuth(() => reviewOpen = true)" style="margin-top:12px;display:block;margin-inline:auto;padding:8px 16px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:8px;font-size:13px;cursor:pointer">Écrire la première review</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWatchlist } from "~/composables/useWatchlist";
import { useAnimes } from "~/composables/useAnimes";
import { useReviews } from "~/composables/useReviews";

const route = useRoute();
const animeId = parseInt(route.params.id as string);

const { getAnimeDetails } = useAnimes();
const { fetchWatchlist, getWatchlistItem, addToWatchlist, updateStatus, removeFromWatchlist: removeWatchlistItem } = useWatchlist();
const { getReview, getMovieReviews, createOrUpdateReview } = useReviews();
const { isAuthenticated } = useAuth();
const { requireAuth } = useAuthGuard();

const anime = ref<any>(null);
const loading = ref(true);
const statusOpen = ref(false);
const reviewOpen = ref(false);
const reviewLoading = ref(false);
const myReview = ref({ id: null as any, rating: 7, comment: "" });
const communityReviews = ref<any[]>([]);

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
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
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

const saveReview = async () => {
  if (!watchlistItem.value) return;
  try {
    reviewLoading.value = true;
    await createOrUpdateReview(watchlistItem.value.id, myReview.value.rating, myReview.value.comment);
    communityReviews.value = await getMovieReviews(watchlistItem.value.id);
    reviewOpen.value = false;
  } catch (e) { console.error(e); }
  finally { reviewLoading.value = false; }
};
</script>

<style scoped>
.at-fade-enter-active, .at-fade-leave-active { transition: opacity 0.15s ease; }
.at-fade-enter-from, .at-fade-leave-to { opacity: 0; }
</style>
