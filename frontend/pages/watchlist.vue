<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">Ma Watchlist</h1>
        <NuxtLink
          to="/movies/search"
          class="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition"
        >
          + Ajouter un film
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 mb-8 border-b border-slate-700">
        <button
          v-for="status in ['TO_WATCH', 'WATCHING', 'COMPLETED']"
          :key="status"
          @click="activeStatus = status"
          :class="[
            'px-6 py-3 font-semibold transition border-b-2',
            activeStatus === status
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-400 hover:text-white',
          ]"
        >
          {{ statusLabel(status) }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-400">Chargement...</p>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="bg-red-900 border border-red-700 text-red-100 p-4 rounded mb-6"
      >
        {{ error }}
      </div>

      <!-- Movies Grid -->
      <div
        v-if="!loading && filteredWatchlist.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="item in filteredWatchlist"
          :key="item.id"
          class="group cursor-pointer"
          @click="selectedItem = item"
        >
          <div
            class="relative overflow-hidden rounded-lg mb-4 bg-slate-800 aspect-[2/3]"
          >
            <img
              v-if="item.posterPath"
              :src="`https://image.tmdb.org/t/p/w342${item.posterPath}`"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-500"
            >
              Pas d'affiche
            </div>

            <!-- Status badge -->
            <div
              class="absolute top-2 right-2 bg-amber-500 text-slate-900 px-3 py-1 rounded text-xs font-bold"
            >
              {{ statusLabel(item.status) }}
            </div>
          </div>
          <h3
            class="font-semibold truncate group-hover:text-amber-500 transition"
          >
            {{ item.title }}
          </h3>
          <p class="text-sm text-slate-400">TMDB ID: {{ item.tmdbId }}</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-slate-400 text-lg mb-4">
          Aucun film pour cette catégorie
        </p>
        <NuxtLink
          to="/movies/search"
          class="inline-block bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition"
        >
          Découvrir des films
        </NuxtLink>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedItem"
          class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        >
          <div
            class="bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto relative"
          >
            <button
              @click="selectedItem = null"
              class="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div class="flex gap-6 p-6">
              <img
                v-if="selectedItem.posterPath"
                :src="`https://image.tmdb.org/t/p/w342${selectedItem.posterPath}`"
                :alt="selectedItem.title"
                class="w-32 h-48 rounded object-cover flex-shrink-0"
              />

              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-4">
                  {{ selectedItem.title }}
                </h2>

                <div class="space-y-3 mb-6">
                  <div>
                    <p class="text-slate-400 text-sm">Statut actuel</p>
                    <select
                      :value="selectedItem.status"
                      @change="updateStatus($event.target.value)"
                      class="mt-1 bg-slate-700 text-white px-3 py-2 rounded w-full"
                    >
                      <option value="TO_WATCH">À voir</option>
                      <option value="WATCHING">En cours</option>
                      <option value="COMPLETED">Terminé</option>
                    </select>
                  </div>
                </div>

                <div class="flex gap-3">
                  <NuxtLink
                    :to="`/movies/${selectedItem.tmdbId}`"
                    class="flex-1 bg-amber-500 hover:bg-amber-600 text-center px-4 py-2 rounded font-semibold transition"
                  >
                    Détail & Avis
                  </NuxtLink>
                  <button
                    @click="removeFromWatchlist(selectedItem.id)"
                    class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 font-semibold transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useWatchlist } from "~/composables/useWatchlist";
import { useRouter } from "vue-router";

const router = useRouter();
const {
  watchlist,
  loading,
  error,
  fetchWatchlist,
  updateStatus: updateWatchlistStatus,
  removeFromWatchlist: removeItemFromWatchlist,
} = useWatchlist();
const activeStatus = ref("TO_WATCH");
const selectedItem = ref(null);

onMounted(() => {
  fetchWatchlist();
});

const filteredWatchlist = computed(() => {
  return watchlist.value.filter(
    (item: any) => item.status === activeStatus.value,
  );
});

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    TO_WATCH: "À voir",
    WATCHING: "En cours",
    COMPLETED: "Terminé",
  };
  return labels[status] || status;
};

const updateStatus = async (newStatus: string) => {
  if (selectedItem.value) {
    try {
      await updateWatchlistStatus(selectedItem.value.id, newStatus);
      selectedItem.value = null;
      await fetchWatchlist();
    } catch (e) {
      console.error("Erreur:", e);
    }
  }
};

const removeFromWatchlist = async (id: number) => {
  try {
    await removeItemFromWatchlist(id);
    selectedItem.value = null;
  } catch (e) {
    console.error("Erreur:", e);
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
