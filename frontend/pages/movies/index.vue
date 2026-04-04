<template>
  <main class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Films</h1>
      <NuxtLink
        v-if="auth.isAuthenticated.value"
        to="/movies/add"
        class="btn btn-primary"
      >
        + Ajouter
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-slate-400">Chargement des films...</p>
    </div>

    <div v-else-if="movies.length === 0" class="text-center py-12">
      <p class="text-slate-400">Aucun film pour le moment</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="card overflow-hidden hover:shadow-lg transition cursor-pointer"
        @click="goToMovie(movie.id)"
      >
        <div
          v-if="movie.poster_path"
          class="relative overflow-hidden bg-slate-700 h-64"
        >
          <img
            :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`"
            :alt="movie.title"
            class="w-full h-full object-cover hover:scale-110 transition"
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
            {{
              movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : "-"
            }}
          </p>
          <p class="text-xs text-slate-500">
            ⭐ {{ (movie.vote_average || 0).toFixed(1) }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const auth = useAuth();
const { get } = useApi();

const movies = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await get("/tmdb/popular");
    movies.value = response.data.results || [];
  } catch (error) {
    console.error("Erreur lors du chargement des films:", error);
  } finally {
    isLoading.value = false;
  }
});

const goToMovie = (id: number) => {
  navigateTo(`/movies/${id}`);
};
</script>
