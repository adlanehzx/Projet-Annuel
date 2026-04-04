<template>
  <main class="max-w-7xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Rechercher un film</h1>

    <div class="card p-6 mb-8">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Chercher un film..."
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
      <p class="text-slate-400">Aucun film trouvé</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="movie in results"
        :key="movie.id"
        class="card overflow-hidden hover:shadow-lg transition group"
      >
        <div v-if="movie.poster_path" class="relative overflow-hidden">
          <img
            :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`"
            :alt="movie.title"
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
          <h3 class="font-bold truncate">{{ movie.title }}</h3>
          <p class="text-sm text-slate-400">
            {{ movie.release_date?.split("-")[0] }}
          </p>
          <div v-if="movie.vote_average" class="text-xs text-yellow-400 mt-2">
            ⭐ {{ movie.vote_average.toFixed(1) }}/10
          </div>

          <button
            @click="addToWatchlist(movie)"
            :disabled="isInWatchlist(movie.id) || addingMovieId === movie.id"
            :class="[
              'w-full mt-4 py-2 rounded font-semibold transition',
              isInWatchlist(movie.id)
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-900',
            ]"
          >
            {{ isInWatchlist(movie.id) ? "✓ Dans ma watchlist" : "+ Ajouter" }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import { useWatchlist } from "~/composables/useWatchlist";

const { get } = useApi();
const { watchlist, addToWatchlist: addItemToWatchlist } = useWatchlist();
const searchQuery = ref("");
const results = ref<any[]>([]);
const isLoading = ref(false);
const error = ref("");
const searched = ref(false);
const addingMovieId = ref<number | null>(null);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    error.value = "Veuillez entrer un titre";
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";
    searched.value = true;

    const response = await get(
      `/tmdb/search?q=${encodeURIComponent(searchQuery.value)}`,
    );
    results.value = response.data.results || [];

    if (results.value.length === 0) {
      error.value = "Aucun film trouvé";
    }
  } catch (err: any) {
    error.value = "Erreur lors de la recherche";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const isInWatchlist = (tmdbId: number) => {
  return watchlist.value.some((item: any) => item.tmdbId === tmdbId);
};

const addToWatchlist = async (movie: any) => {
  try {
    addingMovieId.value = movie.id;
    await addItemToWatchlist(movie.id, movie.title, movie.poster_path);
  } catch (err: any) {
    error.value = err.response?.data?.error || "Erreur lors de l'ajout";
    console.error(err);
  } finally {
    addingMovieId.value = null;
  }
};
</script>
