<template>
  <main class="max-w-2xl mx-auto px-4 py-12">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Ajouter un film</h1>
      <NuxtLink to="/movies/search" class="btn btn-secondary text-sm">
        🔍 Chercher sur TMDB
      </NuxtLink>
    </div>

    <form @submit.prevent="submitForm" class="card p-8 space-y-6">
      <div
        v-if="selectedMovie"
        class="p-4 bg-green-500/10 border border-green-500/50 rounded"
      >
        <p class="text-green-400 text-sm">Film sélectionné depuis TMDB ✓</p>
        <p class="text-white font-bold">{{ selectedMovie.title }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Titre</label>
        <input v-model="form.title" type="text" class="input" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Année</label>
          <input v-model.number="form.year" type="number" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Réalisateur</label>
          <input v-model="form.director" type="text" class="input" />
        </div>
      </div>

      <div
        v-if="error"
        class="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
      >
        {{ error }}
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="isLoading"
          class="btn btn-primary flex-1"
        >
          {{ isLoading ? "Ajout..." : "Ajouter" }}
        </button>
        <NuxtLink to="/movies" class="btn btn-secondary flex-1 text-center"
          >Annuler</NuxtLink
        >
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
const { post } = useApi();
const { user } = useAuth();
const isLoading = ref(false);
const error = ref("");
const selectedMovie = ref<any>(null);

const form = reactive({
  title: "",
  year: new Date().getFullYear(),
  director: "",
});

onMounted(() => {
  // Charger le film sélectionné depuis TMDB si disponible
  const stored = sessionStorage.getItem("selectedTmdbMovie");
  if (stored) {
    selectedMovie.value = JSON.parse(stored);
    form.title = selectedMovie.value.title;
    form.year = selectedMovie.value.year;
    form.director = selectedMovie.value.director || "";

    // Nettoyer le sessionStorage
    sessionStorage.removeItem("selectedTmdbMovie");
  }
});

const submitForm = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    if (!form.title.trim()) {
      error.value = "Le titre est requis";
      return;
    }

    await post("/movies", {
      title: form.title,
      year: form.year || null,
      director: form.director || null,
      userId: user.value?.id,
    });

    await navigateTo("/movies");
  } catch (err: any) {
    error.value = err.response?.data?.error || "Erreur lors de l'ajout";
  } finally {
    isLoading.value = false;
  }
};
</script>
