<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-5xl mx-auto">
      <NuxtLink to="/lists" class="text-amber-500 hover:text-amber-400 mb-6 inline-block">
        ← Retour aux listes
      </NuxtLink>

      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-400">Chargement...</p>
      </div>

      <div v-else-if="!list" class="text-center py-12">
        <p class="text-red-400">Liste introuvable</p>
      </div>

      <div v-else>
        <div class="flex justify-between items-start mb-8">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-4xl font-bold">{{ list.title }}</h1>
              <span
                class="text-sm px-3 py-0.5 rounded-full"
                :class="list.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'"
              >
                {{ list.isPublic ? "Publique" : "Privée" }}
              </span>
            </div>
            <p v-if="list.description" class="text-slate-400 mt-1">{{ list.description }}</p>
            <p class="text-slate-500 text-sm mt-1">{{ list.animes?.length || 0 }} anime(s)</p>
          </div>
          <button
            @click="showAddModal = true"
            class="bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-lg font-semibold transition flex-shrink-0"
          >
            + Ajouter un anime
          </button>
        </div>

        <div v-if="list.animes?.length === 0" class="text-center py-16">
          <p class="text-slate-400 text-lg mb-4">Aucun anime dans cette liste</p>
          <button @click="showAddModal = true" class="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition">
            Ajouter le premier anime
          </button>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in list.animes"
            :key="item.id"
            class="group relative"
          >
            <div class="bg-slate-800 rounded-lg overflow-hidden">
              <div class="relative aspect-[2/3] overflow-hidden">
                <img
                  v-if="item.anime.imageUrl"
                  :src="item.anime.imageUrl"
                  :alt="item.anime.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div v-else class="w-full h-full bg-slate-700 flex items-center justify-center text-4xl">🎌</div>
                <div class="absolute top-2 left-2 bg-slate-900/80 text-xs px-2 py-0.5 rounded">
                  #{{ item.position }}
                </div>
                <button
                  @click="handleRemove(item.anime.id)"
                  class="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
              <div class="p-3">
                <h3 class="font-semibold text-sm truncate">{{ item.anime.title }}</h3>
                <p v-if="item.anime.score" class="text-yellow-400 text-xs mt-0.5">⭐ {{ item.anime.score.toFixed(1) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAddModal"
          class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          @click.self="showAddModal = false"
        >
          <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Ajouter un anime</h2>
            <div class="flex gap-2 mb-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Chercher un anime..."
                class="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none"
                @keyup.enter="handleSearch"
              />
              <button @click="handleSearch" class="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded font-semibold transition">
                OK
              </button>
            </div>

            <div v-if="searchLoading" class="text-center py-4 text-slate-400">Recherche...</div>

            <div v-else-if="searchResults.length > 0" class="space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="anime in searchResults"
                :key="anime.id"
                class="flex items-center gap-3 p-2 rounded hover:bg-slate-700 cursor-pointer transition"
                @click="handleAdd(anime.id)"
              >
                <img v-if="anime.imageUrl" :src="anime.imageUrl" :alt="anime.title" class="w-10 h-14 object-cover rounded" />
                <div v-else class="w-10 h-14 bg-slate-600 rounded flex items-center justify-center text-xl">🎌</div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{{ anime.title }}</p>
                  <p v-if="anime.score" class="text-yellow-400 text-xs">⭐ {{ anime.score.toFixed(1) }}</p>
                </div>
              </div>
            </div>

            <div v-if="addError" class="text-red-400 text-sm mt-2">{{ addError }}</div>

            <button @click="showAddModal = false" class="mt-4 w-full bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition">
              Fermer
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useLists } from "~/composables/useLists";
import { useAnimes } from "~/composables/useAnimes";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const listId = parseInt(route.params.id as string);

const { fetchList, addAnimeToList, removeAnimeFromList } = useLists();
const { searchAnimes } = useAnimes();

const list = ref<any>(null);
const loading = ref(true);
const showAddModal = ref(false);
const searchQuery = ref("");
const searchResults = ref<any[]>([]);
const searchLoading = ref(false);
const addError = ref("");

onMounted(async () => {
  try {
    list.value = await fetchList(listId);
  } catch {
    list.value = null;
  } finally {
    loading.value = false;
  }
});

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  try {
    searchLoading.value = true;
    searchResults.value = await searchAnimes(searchQuery.value);
  } catch {
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
};

const handleAdd = async (animeId: number) => {
  try {
    addError.value = "";
    await addAnimeToList(listId, animeId);
    list.value = await fetchList(listId);
    showAddModal.value = false;
    searchQuery.value = "";
    searchResults.value = [];
  } catch (e: any) {
    addError.value = e.response?.data?.error || "Erreur lors de l'ajout";
  }
};

const handleRemove = async (animeId: number) => {
  try {
    await removeAnimeFromList(listId, animeId);
    list.value = await fetchList(listId);
  } catch (e: any) {
    console.error("Erreur suppression:", e);
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
