<template>
  <div style="max-width:1200px;margin:0 auto;padding:22px 24px 48px;width:100%">

    <div style="display:flex;gap:10px;margin-bottom:14px;position:relative;flex-wrap:wrap;align-items:center;z-index:20">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un anime…"
        style="flex:1;min-width:180px;height:40px;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:0 14px;font-size:14px;color:var(--text-primary);font-family:var(--font-body);outline:none"
      />

      <button
        @click="filtersOpen = !filtersOpen"
        :aria-expanded="filtersOpen"
        :style="`display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid ${nActiveFilters ? 'var(--color-accent-secondary)' : 'var(--border)'};border-radius:8px;background:${nActiveFilters ? 'rgba(53,64,140,0.10)' : 'var(--bg-input)'};color:${nActiveFilters ? 'var(--color-accent-secondary)' : 'var(--text-primary)'};font-family:var(--font-body);font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap`"
      >
        <span aria-hidden="true" style="font-size:14px;line-height:1">&#9731;</span>
        Filtres{{ nActiveFilters ? ` (${nActiveFilters})` : '' }}
        <span aria-hidden="true" style="font-size:10px;opacity:0.7">&#9662;</span>
      </button>

      <select v-if="!isMobile" v-model="sortBy" aria-label="Trier" style="padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;cursor:pointer">
        <option value="score">Trier : note</option>
        <option value="title">Trier : titre</option>
        <option value="rank">Trier : rang</option>
      </select>

      <Transition name="at-fade">
        <div v-if="filtersOpen && !isMobile" style="position:absolute;right:0;top:52px;z-index:46;width:340px;max-width:calc(100% - 4px);background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,0.18);padding:18px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:var(--text-secondary)">FILTRES</span>
            <button @click="resetFilters" style="background:none;border:none;color:var(--color-accent-primary);font-family:var(--font-body);font-size:13px;cursor:pointer;padding:2px 4px">Réinitialiser</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
              Genre
              <select v-model="filters.genre" style="width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;cursor:pointer">
                <option value="">Tous les genres</option>
                <option v-for="g in allGenres" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
              Format
              <select v-model="filters.format" style="width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;cursor:pointer">
                <option value="">Tous les formats</option>
                <option value="TV">TV</option>
                <option value="Movie">Movie</option>
                <option value="OVA">OVA</option>
                <option value="ONA">ONA</option>
                <option value="Special">Special</option>
              </select>
            </label>
          </div>
          <button @click="filtersOpen = false" class="at-btn-primary" style="width:100%;margin-top:16px;padding:10px">Afficher {{ totalResults }} résultats</button>
        </div>
      </Transition>
    </div>

    <div v-if="nActiveFilters" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
      <button
        v-for="chip in activeChips"
        :key="chip.key"
        @click="chip.clear()"
        :aria-label="`Retirer le filtre ${chip.label}`"
        style="display:inline-flex;align-items:center;gap:7px;padding:5px 10px;background:rgba(53,64,140,0.10);border:1px solid var(--color-accent-secondary);border-radius:999px;color:var(--color-accent-secondary);font-family:var(--font-body);font-size:13px;cursor:pointer"
      >{{ chip.label }}<span aria-hidden="true" style="font-size:14px;line-height:1">×</span></button>
      <button @click="resetFilters" style="background:none;border:none;color:var(--text-secondary);font-family:var(--font-body);font-size:13px;cursor:pointer;padding:4px 6px;text-decoration:underline">Tout effacer</button>
    </div>

    <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)">{{ totalResults }} résultats</div>

    <div v-if="isLoading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px;margin-top:16px">
      <div
        v-for="anime in animes"
        :key="anime.id"
        role="button"
        tabindex="0"
        @click="navigateTo(`/animes/${anime.id}`)"
        @keydown.enter="navigateTo(`/animes/${anime.id}`)"
        style="cursor:pointer;border-radius:8px"
      >
        <div style="position:relative;aspect-ratio:2/3;border-radius:8px;overflow:hidden;background:var(--bg-elevated);border:1px solid var(--border)">
          <img v-if="anime.imageUrl" :src="anime.imageUrl" :alt="anime.title" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s" />
          <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🎌</div>
          <div
            v-if="isCompleted(anime.id)"
            style="position:absolute;inset:0;pointer-events:none;z-index:1;background:rgba(0,0,0,0.24)"
          />
          <BrandSeal
            v-if="isCompleted(anime.id)"
            :size="54"
            format="png"
            style="position:absolute;right:8px;bottom:8px;z-index:2;transform:rotate(-8deg);opacity:0.92"
          />
        </div>
        <div style="margin-top:8px;font-size:14px;font-weight:500;line-height:1.3;color:var(--text-primary)">{{ anime.title }}</div>
        <div style="margin-top:3px;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">★ {{ anime.score?.toFixed(1) ?? '—' }}</div>
      </div>
    </div>

    <div v-if="totalPages > 1" style="display:flex;justify-content:center;gap:8px;margin-top:30px">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" style="min-width:36px;height:36px;border-radius:6px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:var(--font-mono);font-size:13px;cursor:pointer">‹</button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="changePage(p)"
        :style="`min-width:36px;height:36px;border-radius:6px;border:1px solid var(--border);font-family:var(--font-mono);font-size:13px;cursor:pointer;background:${currentPage===p?'var(--color-accent-primary)':'var(--bg-elevated)'};color:${currentPage===p?'#fff':'var(--text-primary)'}`"
      >{{ p }}</button>
      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" style="min-width:36px;height:36px;border-radius:6px;border:1px solid var(--border);background:var(--bg-elevated);color:var(--text-primary);font-family:var(--font-mono);font-size:13px;cursor:pointer">›</button>
    </div>

    <div v-if="filtersOpen && !isMobile" @click="filtersOpen = false" style="position:fixed;inset:0;z-index:45;background:transparent"></div>

    <Transition name="at-fade">
      <div v-if="filtersOpen && isMobile" style="position:fixed;inset:0;z-index:60;background:var(--bg);display:flex;flex-direction:column;padding:20px;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin:0">Filtres</h2>
          <button @click="filtersOpen = false" aria-label="Fermer les filtres" style="width:36px;height:36px;border:1px solid var(--border);border-radius:8px;background:var(--bg-elevated);color:var(--text-primary);font-size:16px;cursor:pointer">×</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
            Genre
            <select v-model="filters.genre" style="width:100%;padding:11px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;cursor:pointer">
              <option value="">Tous les genres</option>
              <option v-for="g in allGenres" :key="g" :value="g">{{ g }}</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
            Format
            <select v-model="filters.format" style="width:100%;padding:11px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;cursor:pointer">
              <option value="">Tous les formats</option>
              <option value="TV">TV</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
              <option value="Special">Special</option>
            </select>
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--text-primary)">
            Tri
            <select v-model="sortBy" style="width:100%;padding:11px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;cursor:pointer">
              <option value="score">Note</option>
              <option value="title">Titre</option>
              <option value="rank">Rang</option>
            </select>
          </label>
        </div>
        <div style="display:flex;gap:12px;margin-top:auto;padding-top:24px">
          <button @click="resetFilters" class="at-btn-secondary" style="flex:1;padding:12px">Réinitialiser</button>
          <button @click="filtersOpen = false" class="at-btn-primary" style="flex:1;padding:12px">Appliquer</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// Nuxt auto-imports these at runtime; declare them for TS when Nuxt types are unavailable.
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

type AnimeListItem = {
  id: number;
  title: string;
  titleEnglish?: string | null;
  rank?: number | null;
  score?: number | null;
  status?: string | null;
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
const isMobile = ref(false);
const PAGE_SIZE = 24;
const totalPages = ref(1);
const totalResults = ref(0);
const filters = reactive({ genre: "", format: "" });

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
        format: filters.format || undefined,
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

onMounted(async () => {
  updateMobile();
  if (process.client) window.addEventListener("resize", updateMobile);
  try {
    await fetchAnimes();
    if (isAuthenticated.value) await fetchWatchlist();
  } catch (e) {
    console.error(e);
  }
});

onBeforeUnmount(() => {
  if (process.client) window.removeEventListener("resize", updateMobile);
});

const allGenres = computed(() => {
  const set = new Set<string>();
  animes.value.forEach((a: AnimeListItem) =>
    a.genres?.forEach((g: any) => set.add(g?.genre?.name ?? g)),
  );
  return [...set].sort();
});

const nActiveFilters = computed(() => Object.values(filters).filter(Boolean).length);

const activeChips = computed(() => {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.genre) chips.push({ key: "genre", label: filters.genre, clear: () => { filters.genre = ""; } });
  if (filters.format) chips.push({ key: "format", label: filters.format, clear: () => { filters.format = ""; } });
  return chips;
});

const isCompleted = (animeId: number) => watchlist.value.some((w: any) => w.animeId === animeId && w.status === "COMPLETED");
const resetFilters = async () => {
  filters.genre = "";
  filters.format = "";
  search.value = "";
  currentPage.value = 1;
  await fetchAnimes();
};

const changePage = async (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === currentPage.value) return;
  currentPage.value = nextPage;
  await fetchAnimes();
};

watch([search, () => filters.genre, () => filters.format, sortBy], async () => {
  currentPage.value = 1;
  await fetchAnimes();
});
</script>

<style scoped>
.at-fade-enter-active, .at-fade-leave-active { transition: opacity 0.15s ease; }
.at-fade-enter-from, .at-fade-leave-to { opacity: 0; }
</style>
