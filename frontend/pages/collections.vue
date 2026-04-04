<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">Mes Collections</h1>
        <button
          @click="showCreateModal = true"
          class="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition"
        >
          + Nouvelle collection
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

      <!-- Collections Grid -->
      <div
        v-if="!loading && collections.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <NuxtLink
          v-for="collection in collections"
          :key="collection.id"
          :to="`/collections/${collection.id}`"
          class="group bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition"
        >
          <div
            class="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 relative overflow-hidden"
          >
            <!-- Collection cover with thumbnails -->
            <div
              v-if="collection.items.length > 0"
              class="grid grid-cols-2 gap-1 p-2"
            >
              <img
                v-for="(item, i) in collection.items.slice(0, 4)"
                :key="i"
                v-if="item.watchlist.posterPath"
                :src="`https://image.tmdb.org/t/p/w154${item.watchlist.posterPath}`"
                :alt="item.watchlist.title"
                class="w-full h-full object-cover group-hover:scale-110 transition"
              />
            </div>
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-slate-500"
            >
              Vide
            </div>
          </div>

          <div class="p-4">
            <h3 class="font-bold text-lg truncate">{{ collection.name }}</h3>
            <p class="text-slate-400 text-sm mb-3">
              {{ collection.items.length }} film{{
                collection.items.length !== 1 ? "s" : ""
              }}
            </p>
            <p class="text-slate-400 text-xs line-clamp-2">
              {{ collection.description || "Aucune description" }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-slate-400 text-lg mb-4">
          Aucune collection pour le moment
        </p>
        <button
          @click="showCreateModal = true"
          class="inline-block bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition"
        >
          Créer une collection
        </button>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCreateModal"
          class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-slate-800 rounded-lg max-w-md w-full p-6 relative">
            <button
              @click="showCreateModal = false"
              class="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h2 class="text-2xl font-bold mb-6">Nouvelle collection</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-slate-400 text-sm mb-2">Nom</label>
                <input
                  v-model="newCollection.name"
                  type="text"
                  placeholder="Ex: À regarder cet hiver"
                  class="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-slate-400 text-sm mb-2"
                  >Description</label
                >
                <textarea
                  v-model="newCollection.description"
                  placeholder="Description optionnelle..."
                  class="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none h-24 resize-none"
                />
              </div>

              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="newCollection.isPublic"
                  type="checkbox"
                  class="w-4 h-4"
                />
                <span class="text-slate-300"
                  >Public (visible aux autres utilisateurs)</span
                >
              </label>

              <div class="flex gap-3 pt-4">
                <button
                  @click="showCreateModal = false"
                  class="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  @click="createCollection"
                  :disabled="!newCollection.name || createLoading"
                  class="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 px-4 py-2 rounded font-semibold transition"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCollections } from "~/composables/useCollections";

const {
  collections,
  loading,
  error,
  fetchCollections,
  createCollection: createNewCollection,
} = useCollections();
const showCreateModal = ref(false);
const createLoading = ref(false);
const newCollection = ref({
  name: "",
  description: "",
  isPublic: false,
});

onMounted(() => {
  fetchCollections();
});

const createCollection = async () => {
  try {
    createLoading.value = true;
    await createNewCollection(
      newCollection.value.name,
      newCollection.value.description,
      newCollection.value.isPublic,
    );
    showCreateModal.value = false;
    newCollection.value = { name: "", description: "", isPublic: false };
  } catch (e) {
    console.error("Erreur:", e);
  } finally {
    createLoading.value = false;
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
