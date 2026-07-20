<template>
  <main class="max-w-7xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Rechercher un anime</h1>

    <div class="card p-6 mb-8">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Chercher un anime..."
          class="input flex-1"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="btn btn-primary">Chercher</button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-slate-400">Chargement...</p>
    </div>

    <div
      v-else-if="error"
      class="p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400"
    >
      {{ error }}
    </div>

    <div v-else-if="results.length === 0 && searched" class="text-center py-12">
      <p class="text-slate-400">Aucun anime trouvé</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="anime in results"
        :key="anime.id"
        class="card overflow-hidden hover:shadow-lg transition group"
      >
        <div v-if="anime.imageUrl" class="relative overflow-hidden">
          <img
            :src="anime.imageUrl"
            :alt="anime.title"
            class="w-full h-64 object-cover group-hover:scale-105 transition"
          />
        </div>
        <div
          v-else
          class="bg-slate-700 h-64 flex items-center justify-center text-5xl"
        >
          🎬
        </div>

        <div class="p-4">
          <h3 class="font-bold truncate">{{ anime.title }}</h3>
          <p class="text-sm text-slate-400">
            {{ anime.titleEnglish || anime.status || "Anime" }}
          </p>
          <div v-if="anime.score" class="text-xs text-yellow-400 mt-2">
            ⭐ {{ anime.score.toFixed(1) }}/10
          </div>

          <button
            @click="addToWatchlist(anime)"
            :disabled="isInWatchlist(anime.id) || addingAnimeId === anime.id"
            :class="[
              'w-full mt-4 py-2 rounded font-semibold transition',
              isInWatchlist(anime.id)
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-900',
            ]"
          >
            {{ isInWatchlist(anime.id) ? "✓ Dans ma watchlist" : "+ Ajouter" }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAnimes } from "~/composables/useAnimes";
import { useWatchlist } from "~/composables/useWatchlist";

const { searchAnimes } = useAnimes();
const { watchlist, addToWatchlist: addItemToWatchlist } = useWatchlist();
const searchQuery = ref("");
const results = ref<any[]>([]);
const isLoading = ref(false);
const error = ref("");
const searched = ref(false);
const addingAnimeId = ref<number | null>(null);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    error.value = "Veuillez entrer un titre";
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";
    searched.value = true;

    results.value = await searchAnimes(searchQuery.value);

    if (results.value.length === 0) {
      error.value = "Aucun anime trouvé";
    }
  } catch (err: any) {
    error.value = "Erreur lors de la recherche";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const isInWatchlist = (animeId: number) => {
  return watchlist.value.some((item: any) => item.animeId === animeId);
};

const addToWatchlist = async (anime: any) => {
  try {
    addingAnimeId.value = anime.id;
    await addItemToWatchlist(anime.id);
  } catch (err: any) {
    error.value = err.response?.data?.error || "Erreur lors de l'ajout";
    console.error(err);
  } finally {
    addingAnimeId.value = null;
  }
};
</script>
