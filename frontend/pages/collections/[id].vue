<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <NuxtLink
        to="/collections"
        class="text-amber-500 hover:text-amber-400 mb-6 inline-block"
      >
        ← Retour aux collections
      </NuxtLink>

      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-400">Chargement...</p>
      </div>

      <div v-else-if="collection">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h1 class="text-4xl font-bold mb-2">{{ collection.name }}</h1>
            <p class="text-slate-400 mb-4">{{ collection.description }}</p>
            <p class="text-slate-500 text-sm">
              {{ collection.items.length }} film{{
                collection.items.length !== 1 ? "s" : ""
              }}
              • {{ collection.isPublic ? "🌍 Public" : "🔒 Privé" }}
            </p>
          </div>
          <button
            @click="deleteCollection"
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition"
          >
            Supprimer
          </button>
        </div>

        <!-- Films Grid -->
        <div
          v-if="collection.items.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="item in collection.items"
            :key="item.id"
            class="group relative"
          >
            <div
              class="relative overflow-hidden rounded-lg mb-4 bg-slate-800 aspect-[2/3]"
            >
              <img
                v-if="item.watchlist.posterPath"
                :src="`https://image.tmdb.org/t/p/w342${item.watchlist.posterPath}`"
                :alt="item.watchlist.title"
                class="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-slate-500"
              >
                Pas d'affiche
              </div>

              <!-- Remove button -->
              <button
                @click="removeFromCollection(item.id)"
                class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
            <h3 class="font-semibold truncate">{{ item.watchlist.title }}</h3>
            <p class="text-sm text-slate-400">
              {{ statusLabel(item.watchlist.status) }}
            </p>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12">
          <p class="text-slate-400 text-lg">Aucun film dans cette collection</p>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-red-400">Collection non trouvée</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "~/composables/useApi";
import { useCollections } from "~/composables/useCollections";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { deleteCollection: deleteCol, removeItemFromCollection } =
  useCollections();

const collection = ref(null);
const loading = ref(true);
const collectionId = parseInt(route.params.id as string);

onMounted(async () => {
  try {
    const response = await api.get(`/collections/${collectionId}`);
    collection.value = response.data;
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    loading.value = false;
  }
});

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    TO_WATCH: "À voir",
    WATCHING: "En cours",
    COMPLETED: "Terminé",
  };
  return labels[status] || status;
};

const deleteCollection = async () => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette collection?")) {
    try {
      await deleteCol(collectionId);
      await router.push("/collections");
    } catch (e) {
      console.error("Erreur:", e);
    }
  }
};

const removeFromCollection = async (itemId: number) => {
  try {
    await removeItemFromCollection(collectionId, itemId);
    collection.value.items = collection.value.items.filter(
      (item: any) => item.id !== itemId,
    );
  } catch (e) {
    console.error("Erreur:", e);
  }
};
</script>
