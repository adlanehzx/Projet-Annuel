<template>
  <div class="catalogue-page" style="max-width:1200px;margin:0 auto;padding:22px 24px 48px;width:100%">

    <div :style="`display:flex;gap:10px;margin-bottom:14px;position:relative;flex-wrap:wrap;align-items:center;z-index:${(filtersOpen || sortOpen) && !isMobile ? 50 : 20}`">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un animé…"
        class="at-input"
        style="flex:1;min-width:180px;height:40px;padding:0 14px"
      />

      <button
        type="button"
        @click="toggleFilters"
        :aria-expanded="filtersOpen"
        class="at-toolbar-btn"
        :class="{ 'is-active': !!nActiveFilters || filtersOpen }"
      >
        <AppIcon name="filter" :size="16" style="flex-shrink:0;opacity:0.92" />
        Filtres{{ nActiveFilters ? ` (${nActiveFilters})` : '' }}
        <span aria-hidden="true" style="font-size:10px;opacity:0.7;margin-left:1px">&#9662;</span>
      </button>

      <button
        v-if="!isMobile"
        type="button"
        @click="toggleSort"
        :aria-expanded="sortOpen"
        class="at-toolbar-btn"
        :class="{ 'is-active': sortOpen }"
      >
        Trie : {{ sortLabel }}
        <span aria-hidden="true" style="font-size:10px;opacity:0.7">&#9662;</span>
      </button>

      <Transition name="at-panel">
        <div
          v-if="filtersOpen && !isMobile"
          @click.stop
          class="at-panel"
          style="position:absolute;right:0;top:52px;z-index:46;width:340px;max-width:calc(100% - 4px);padding:18px"
        >
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:var(--text-secondary)">FILTRES</span>
            <button type="button" @click="resetFilters" class="at-btn-ghost is-accent">Réinitialiser</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
              Genre
              <select v-model="filters.genre" class="at-input" style="cursor:pointer;padding:9px 10px">
                <option value="">Tous les genres</option>
                <option v-for="g in allGenres" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
              Année
              <select v-model="filters.year" class="at-input" style="cursor:pointer;padding:9px 10px">
                <option value="">Toutes les années</option>
                <option v-for="y in allYears" :key="y" :value="String(y)">{{ y }}</option>
              </select>
            </label>
          </div>
          <button type="button" @click="filtersOpen = false" class="at-btn-primary" style="width:100%;margin-top:16px;padding:10px">Afficher {{ totalResults }} résultats</button>
        </div>
      </Transition>

      <Transition name="at-panel">
        <div
          v-if="sortOpen && !isMobile"
          @click.stop
          class="at-panel"
          style="position:absolute;right:0;top:52px;z-index:46;width:280px;max-width:calc(100% - 4px);padding:18px"
        >
          <div style="display:flex;flex-direction:column;gap:6px">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              type="button"
              @click="selectSort(opt.value)"
              class="at-option"
              :class="{ 'is-active': sortBy === opt.value }"
            >
              <span>{{ opt.label }}</span>
              <span v-if="sortBy === opt.value" style="color:var(--color-accent-primary)">✓</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="nActiveFilters" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
      <button
        v-for="chip in activeChips"
        :key="chip.key"
        type="button"
        @click="chip.clear()"
        :aria-label="`Retirer le filtre ${chip.label}`"
        class="at-chip"
      >{{ chip.label }}<span aria-hidden="true" style="font-size:14px;line-height:1">×</span></button>
      <button type="button" @click="resetFilters" class="at-btn-ghost" style="text-decoration:underline">Tout effacer</button>
    </div>

    <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)">{{ totalResults }} résultats</div>

    <div v-if="isLoading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:16px;margin-top:16px">
      <div
        v-for="anime in animes"
        :key="anime.id"
        role="button"
        tabindex="0"
        class="at-poster"
        @click="navigateTo(`/animes/${anime.id}`)"
        @keydown.enter="navigateTo(`/animes/${anime.id}`)"
      >
        <div class="at-poster-media">
          <img v-if="anime.imageUrl" :src="anime.imageUrl" :alt="anime.title" />
          <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🎌</div>
          <div
            v-if="isCompleted(anime.id)"
            style="position:absolute;inset:0;pointer-events:none;z-index:1;background:rgba(0,0,0,0.24)"
          />
          <BrandSeal
            v-if="isCompleted(anime.id)"
            :size="54"
            format="svg"
            loading="eager"
            style="position:absolute;right:8px;bottom:8px;z-index:2;transform:rotate(-8deg);opacity:0.92"
          />
        </div>
        <div class="at-poster-title">{{ anime.title }}</div>
        <div style="margin-top:3px;font-family:var(--font-mono);font-size:12px;color:var(--rating)">★ {{ anime.score?.toFixed(1) ?? '—' }}</div>
      </div>
    </div>

    <div v-if="totalPages > 1" style="display:flex;justify-content:center;gap:8px;margin-top:30px;flex-wrap:wrap">
      <button
        type="button"
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="at-page-btn at-page-btn-nav"
        :class="{ 'is-disabled': currentPage === 1 }"
        aria-label="Page précédente"
      >
        <AppIcon name="chevron-left" :size="18" />
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        type="button"
        @click="changePage(p)"
        class="at-page-btn"
        :class="{ 'is-active': currentPage === p }"
      >{{ p }}</button>
      <button
        type="button"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="at-page-btn at-page-btn-nav"
        :class="{ 'is-disabled': currentPage === totalPages }"
        aria-label="Page suivante"
      >
        <AppIcon name="chevron-right" :size="18" />
      </button>
    </div>

    <div v-if="(filtersOpen || sortOpen) && !isMobile" @click="closePanels" style="position:fixed;inset:0;z-index:45;background:transparent"></div>

    <Transition name="at-sheet">
      <div v-if="filtersOpen && isMobile" style="position:fixed;inset:0;z-index:60;background:var(--bg);display:flex;flex-direction:column;padding:20px;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;letter-spacing:-0.01em;margin:0">Filtres</h2>
          <button type="button" @click="filtersOpen = false" aria-label="Fermer les filtres" class="at-icon-btn" style="border-radius:8px;width:36px;height:36px;font-size:16px">×</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
            Genre
            <select v-model="filters.genre" class="at-input" style="cursor:pointer;padding:11px 10px">
              <option value="">Tous les genres</option>
              <option v-for="g in allGenres" :key="g" :value="g">{{ g }}</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
            Année
            <select v-model="filters.year" class="at-input" style="cursor:pointer;padding:11px 10px">
              <option value="">Toutes les années</option>
              <option v-for="y in allYears" :key="y" :value="String(y)">{{ y }}</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
            Tri
            <select v-model="sortBy" class="at-input" style="cursor:pointer;padding:11px 10px">
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </label>
        </div>
        <div style="display:flex;gap:12px;margin-top:auto;padding-top:24px">
          <button type="button" @click="resetFilters" class="at-btn-secondary" style="flex:1;padding:12px">Réinitialiser</button>
          <button type="button" @click="filtersOpen = false" class="at-btn-primary" style="flex:1;padding:12px">Appliquer</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
declare const useRuntimeConfig: any;
declare const useWatchlist: any;
declare const useAuth: any;
declare const ref: any;
declare const reactive: any;
declare const computed: any;
declare const watch: any;
declare const onMounted: any;
declare const onBeforeUnmount: any;
declare const process: any;
declare const $fetch: any;
declare const navigateTo: any;

type AnimeListItem = {
  id: number;
  title: string;
  titleEnglish?: string | null;
  rank?: number | null;
  score?: number | null;
  status?: string | null;
  imageUrl?: string | null;
  genres?: Array<{ genre?: { name?: string | null } | null } | string>;
};

const config = useRuntimeConfig();
const { watchlist, fetchWatchlist } = useWatchlist();
const { isAuthenticated } = useAuth();

const animes = ref<AnimeListItem[]>([]);
const isLoading = ref(true);
const search = ref("");
const sortBy = ref("score");
const currentPage = ref(1);
const filtersOpen = ref(false);
const sortOpen = ref(false);
const isMobile = ref(false);
const PAGE_SIZE = 24;
const totalPages = ref(1);
const totalResults = ref(0);
const allGenres = ref<string[]>([]);
const allYears = ref<number[]>([]);
const filters = reactive({ genre: "", year: "" });
let searchTimer: ReturnType<typeof setTimeout> | null = null;

const sortOptions = [
  { value: "score", label: "Note" },
  { value: "title", label: "Titre" },
  { value: "rank", label: "Rang" },
];

const sortLabel = computed(
  () => sortOptions.find((opt) => opt.value === sortBy.value)?.label || "Note",
);

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total));
  return [...pages].sort((a, b) => a - b);
});

const fetchFilterOptions = async () => {
  try {
    const response = await $fetch<any>("/animes/filter-options", {
      baseURL: config.public.apiBase,
    });
    allGenres.value = Array.isArray(response?.genres)
      ? response.genres.map((g: any) => g.name).filter(Boolean)
      : [];
    allYears.value = Array.isArray(response?.years) ? response.years : [];
  } catch (e) {
    console.error(e);
    allGenres.value = [];
    allYears.value = [];
  }
};

const fetchAnimes = async () => {
  try {
    isLoading.value = true;

    const response = await $fetch<any>("/animes", {
      baseURL: config.public.apiBase,
      query: {
        page: currentPage.value,
        limit: PAGE_SIZE,
        sort: sortBy.value,
        q: search.value.trim() || undefined,
        genre: filters.genre || undefined,
        year: filters.year || undefined,
      },
    });

    animes.value = Array.isArray(response?.data) ? response.data : [];
    totalPages.value = Number(response?.pagination?.totalPages ?? 1);
    totalResults.value = Number(response?.pagination?.total ?? animes.value.length);
  } catch (e) {
    console.error(e);
    animes.value = [];
    totalPages.value = 1;
    totalResults.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const updateMobile = () => { if (process.client) isMobile.value = window.innerWidth < 1024; };

const closePanels = () => {
  filtersOpen.value = false;
  sortOpen.value = false;
};

const toggleFilters = () => {
  sortOpen.value = false;
  filtersOpen.value = !filtersOpen.value;
};

const toggleSort = () => {
  filtersOpen.value = false;
  sortOpen.value = !sortOpen.value;
};

const selectSort = (value: string) => {
  sortBy.value = value;
  sortOpen.value = false;
};

onMounted(async () => {
  updateMobile();
  if (process.client) window.addEventListener("resize", updateMobile);
  try {
    await Promise.all([fetchFilterOptions(), fetchAnimes()]);
    if (isAuthenticated.value) await fetchWatchlist();
  } catch (e) {
    console.error(e);
  }
});

onBeforeUnmount(() => {
  if (process.client) window.removeEventListener("resize", updateMobile);
  if (searchTimer) clearTimeout(searchTimer);
});

const nActiveFilters = computed(() => Object.values(filters).filter(Boolean).length);

const activeChips = computed(() => {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.genre) chips.push({ key: "genre", label: filters.genre, clear: () => { filters.genre = ""; } });
  if (filters.year) chips.push({ key: "year", label: filters.year, clear: () => { filters.year = ""; } });
  return chips;
});

const isCompleted = (animeId: number) =>
  isAuthenticated.value &&
  watchlist.value.some((w: any) => w.animeId === animeId && w.status === "COMPLETED");

watch(isAuthenticated, async (auth) => {
  if (auth) await fetchWatchlist();
});

const resetFilters = async () => {
  filters.genre = "";
  filters.year = "";
  search.value = "";
  currentPage.value = 1;
  await fetchAnimes();
};

const changePage = async (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === currentPage.value) return;
  currentPage.value = nextPage;
  await fetchAnimes();
};

watch(
  [() => filters.genre, () => filters.year, sortBy],
  async () => {
    currentPage.value = 1;
    await fetchAnimes();
  },
);

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    currentPage.value = 1;
    await fetchAnimes();
  }, 280);
});
</script>

<style scoped>
@media (max-width: 768px) {
  .catalogue-page {
    padding: 16px 14px 40px !important;
  }
}
</style>
