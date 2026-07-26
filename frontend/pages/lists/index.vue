<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">Mes listes</h1>
        <button
          @click="showCreateModal = true"
          class="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition"
        >
          + Nouvelle liste
        </button>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-400">Chargement...</p>
      </div>

      <div v-else-if="error" class="bg-red-900 border border-red-700 text-red-100 p-4 rounded mb-6">
        {{ error }}
      </div>

      <div v-else-if="lists.length === 0" class="text-center py-16">
        <p class="text-slate-400 text-lg mb-4">Aucune liste pour le moment</p>
        <button
          @click="showCreateModal = true"
          class="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-semibold transition"
        >
          Créer ma première liste
        </button>
      </div>

      <div v-else class="grid gap-6">
        <div
          v-for="list in lists"
          :key="list.id"
          class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-amber-500/50 transition"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-xl font-bold">{{ list.title }}</h2>
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="list.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'"
                >
                  {{ list.isPublic ? "Publique" : "Privée" }}
                </span>
              </div>
              <p v-if="list.description" class="text-slate-400 text-sm">{{ list.description }}</p>
              <p class="text-slate-500 text-xs mt-1">{{ list.animes?.length || 0 }} anime(s)</p>
            </div>
            <div class="flex gap-2 ml-4">
              <NuxtLink
                :to="`/lists/${list.id}`"
                class="px-4 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-sm font-semibold transition"
              >
                Voir
              </NuxtLink>
              <button
                @click="confirmDelete(list)"
                class="px-4 py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-sm font-semibold transition"
              >
                Supprimer
              </button>
            </div>
          </div>

          <div v-if="list.animes?.length > 0" class="flex gap-2 overflow-x-auto pb-1">
            <img
              v-for="item in list.animes.slice(0, 6)"
              :key="item.id"
              :src="item.anime.imageUrl"
              :alt="item.anime.title"
              class="w-12 h-16 object-cover rounded flex-shrink-0"
            />
            <div
              v-if="list.animes.length > 6"
              class="w-12 h-16 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center text-xs text-slate-400"
            >
              +{{ list.animes.length - 6 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCreateModal"
          class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          @click.self="showCreateModal = false"
        >
          <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">Nouvelle liste</h2>
            <div class="space-y-4">
              <div>
                <label class="text-sm text-slate-400 mb-1 block">Titre *</label>
                <input v-model="form.title" type="text" class="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none" placeholder="Mon top shonen..." />
              </div>
              <div>
                <label class="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea v-model="form.description" class="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-amber-500 focus:outline-none resize-none h-20" placeholder="Description de la liste..." />
              </div>
              <div class="flex items-center gap-2">
                <input v-model="form.isPublic" type="checkbox" id="isPublic" class="accent-amber-500" />
                <label for="isPublic" class="text-sm text-slate-300">Rendre publique</label>
              </div>
              <div v-if="createError" class="text-red-400 text-sm">{{ createError }}</div>
              <div class="flex gap-3 pt-2">
                <button
                  @click="handleCreate"
                  :disabled="createLoading"
                  class="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 py-2 rounded font-semibold transition"
                >
                  {{ createLoading ? "Création..." : "Créer" }}
                </button>
                <button @click="showCreateModal = false" class="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="fade">
        <div
          v-if="listToDelete"
          class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-slate-800 rounded-lg p-6 w-full max-w-sm text-center">
            <p class="text-lg font-semibold mb-2">Supprimer la liste ?</p>
            <p class="text-slate-400 text-sm mb-6">« {{ listToDelete.title }} » sera définitivement supprimée.</p>
            <div class="flex gap-3">
              <button @click="handleDelete" class="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded font-semibold transition">Supprimer</button>
              <button @click="listToDelete = null" class="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-semibold transition">Annuler</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useLists } from "~/composables/useLists";

definePageMeta({ middleware: "auth" });

const { lists, loading, error, fetchLists, createList, deleteList } = useLists();

const showCreateModal = ref(false);
const createLoading = ref(false);
const createError = ref("");
const listToDelete = ref<any>(null);

const form = reactive({ title: "", description: "", isPublic: false });

onMounted(() => fetchLists());

const handleCreate = async () => {
  if (!form.title.trim()) {
    createError.value = "Le titre est requis";
    return;
  }
  try {
    createLoading.value = true;
    createError.value = "";
    await createList(form.title.trim(), form.description.trim(), form.isPublic);
    showCreateModal.value = false;
    form.title = "";
    form.description = "";
    form.isPublic = false;
  } catch (e: any) {
    createError.value = e.response?.data?.error || "Erreur lors de la création";
  } finally {
    createLoading.value = false;
  }
};

const confirmDelete = (list: any) => {
  listToDelete.value = list;
};

const handleDelete = async () => {
  if (!listToDelete.value) return;
  try {
    await deleteList(listToDelete.value.id);
    listToDelete.value = null;
  } catch {
    listToDelete.value = null;
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
