<template>
  <main class="max-w-7xl mx-auto px-4 py-12">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Catalogue Animes</h1>
      <NuxtLink to="/movies/search" class="btn btn-primary">
        🔍 Rechercher
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-slate-400">Chargement des animes...</p>
    </div>

    <div v-else-if="animes.length === 0" class="text-center py-12">
      <p class="text-slate-400">Aucun anime pour le moment</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="anime in animes"
        :key="anime.id"
        class="card overflow-hidden hover:shadow-lg transition cursor-pointer"
        @click="navigateTo(`/movies/${anime.id}`)"
      >
        <div v-if="anime.imageUrl" class="relative overflow-hidden bg-slate-700 h-64">
          <img
            :src="anime.imageUrl"
            :alt="anime.title"
            class="w-full h-full object-cover hover:scale-110 transition"
          />
        </div>
        <div v-else class="bg-slate-700 h-64 flex items-center justify-center text-5xl">
          🎌
        </div>
        <div class="p-4">
          <h3 class="font-bold truncate">{{ anime.title }}</h3>
          <p class="text-sm text-slate-400 truncate">
            {{ anime.titleEnglish || anime.status || "Anime" }}
          </p>
          <p v-if="anime.score" class="text-xs text-yellow-400 mt-1">
            ⭐ {{ anime.score.toFixed(1) }}/10
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const animes = ref<any[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const data = await $fetch<any[]>("/animes", {
      baseURL: config.public.apiBase,
    });
    animes.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erreur chargement catalogue:", error);
    animes.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>
