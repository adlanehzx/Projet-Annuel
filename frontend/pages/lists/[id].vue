<template>
  <div style="max-width:860px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <NuxtLink
      to="/lists"
      style="display:inline-block;margin-bottom:18px;font-size:14px;color:var(--text-secondary);text-decoration:none"
    >
      ← Mes listes
    </NuxtLink>

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="!list" style="text-align:center;padding:48px;color:var(--color-accent-primary)">
      Liste introuvable
    </div>

    <template v-else>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap">
        <div style="min-width:0;flex:1">
          <h1 style="font-family:var(--font-display);font-weight:700;font-size:34px;letter-spacing:-0.01em;margin:0 0 8px;color:var(--text-primary)">
            {{ list.title }}
          </h1>
          <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary)">
            {{ animeCount }} animé{{ animeCount !== 1 ? "s" : "" }} · {{ list.isPublic ? "Publique" : "Privée" }}
          </div>
          <p
            v-if="list.description"
            style="margin:10px 0 0;font-size:15px;line-height:1.55;color:var(--text-secondary);max-width:560px"
          >
            {{ list.description }}
          </p>
        </div>
        <button
          type="button"
          class="at-btn-primary"
          @click="showAddModal = true"
        >
          + Ajouter un animé
        </button>
      </div>

      <div
        v-if="animeCount === 0"
        style="padding:48px 20px;border:1px dashed var(--border);border-radius:12px;text-align:center"
      >
        <p style="margin:0 0 14px;font-size:15px;color:var(--text-secondary)">Aucun animé dans cette liste</p>
        <button type="button" class="at-btn-primary" @click="showAddModal = true">
          Ajouter le premier animé
        </button>
      </div>

      <div v-else style="display:flex;flex-direction:column;gap:10px">
        <div
          v-for="(item, index) in list.animes"
          :key="item.id"
          class="list-row"
          draggable="true"
          @dragstart="onDragStart(item.animeId ?? item.anime?.id)"
          @dragover.prevent="onDragOverItem(item.animeId ?? item.anime?.id)"
          @drop.prevent="onDropOnItem(item.animeId ?? item.anime?.id)"
          @dragend="onDragEnd"
          :style="rowStyle(item.animeId ?? item.anime?.id)"
        >
          <div style="width:28px;text-align:center;font-family:var(--font-mono);font-size:14px;color:var(--text-secondary);flex-shrink:0">
            {{ Number(index) + 1 }}
          </div>

          <div
            title="Glisser pour réordonner"
            style="width:18px;color:var(--text-tertiary);font-size:12px;letter-spacing:1px;line-height:1.1;cursor:grab;user-select:none;flex-shrink:0"
          >
            ⋮⋮
          </div>

          <div
            :style="`width:52px;height:70px;border-radius:8px;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${thumbBg(item.anime)};color:${thumbFg(item.anime)};font-family:var(--font-display);font-weight:700;font-size:15px`"
          >
            <img
              v-if="item.anime?.imageUrl"
              :src="item.anime.imageUrl"
              :alt="item.anime.title"
              style="width:100%;height:100%;object-fit:cover"
            />
            <span v-else>{{ initials(item.anime?.title) }}</span>
          </div>

          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ item.anime?.title || "Animé" }}
            </div>
            <div style="margin-top:4px;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">
              {{ metaLine(item.anime) }}
            </div>
          </div>

          <div class="list-row-actions" style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <div style="display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden">
              <button
                type="button"
                title="Monter"
                :disabled="Number(index) === 0 || reordering"
                @click.stop="moveItem(Number(index), -1)"
                class="list-action-btn"
              >
                ↑
              </button>
              <button
                type="button"
                title="Descendre"
                :disabled="Number(index) >= animeCount - 1 || reordering"
                @click.stop="moveItem(Number(index), 1)"
                class="list-action-btn"
                style="border-left:1px solid var(--border)"
              >
                ↓
              </button>
            </div>
            <button
              type="button"
              title="Retirer"
              :disabled="reordering"
              @click.stop="handleRemove(item.animeId ?? item.anime?.id)"
              class="list-action-btn list-action-btn-alone"
            >
              ×
            </button>
          </div>
        </div>

        <p style="margin:8px 0 0;font-size:13px;color:var(--text-tertiary)">
          Maintenir ⋮⋮ pour réordonner (drag), ou utilisez ↑ / ↓
        </p>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAddModal"
          style="position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:80"
          @click.self="showAddModal = false"
        >
          <div style="width:100%;max-width:460px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:22px">
            <h2 style="margin:0 0 16px;font-family:var(--font-display);font-weight:700;font-size:20px;letter-spacing:-0.01em;color:var(--text-primary)">
              Ajouter un animé
            </h2>
            <div style="display:flex;gap:8px;margin-bottom:14px">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Chercher un animé..."
                class="at-input"
                style="flex:1"
                @keyup.enter="handleSearch"
              />
              <button type="button" class="at-btn-primary" @click="handleSearch">OK</button>
            </div>

            <div v-if="searchLoading" style="text-align:center;padding:16px;color:var(--text-secondary);font-size:14px">Recherche...</div>

            <div v-else-if="searchResults.length > 0" style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto">
              <button
                v-for="anime in searchResults"
                :key="anime.id"
                type="button"
                @click="handleAdd(anime.id)"
                style="display:flex;align-items:center;gap:12px;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);cursor:pointer;text-align:left"
              >
                <img
                  v-if="anime.imageUrl"
                  :src="anime.imageUrl"
                  :alt="anime.title"
                  style="width:40px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0"
                />
                <div
                  v-else
                  style="width:40px;height:56px;border-radius:6px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0"
                >
                  🎌
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    {{ anime.title }}
                  </div>
                  <div v-if="anime.score" style="margin-top:3px;font-family:var(--font-mono);font-size:12px;color:var(--rating)">
                    ★ {{ anime.score.toFixed(1) }}
                  </div>
                </div>
              </button>
            </div>

            <p v-if="addError" style="margin:10px 0 0;font-size:13px;color:var(--color-accent-primary)">{{ addError }}</p>

            <button
              type="button"
              class="at-btn-secondary"
              style="width:100%;margin-top:14px"
              @click="showAddModal = false"
            >
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

const { fetchList, addAnimeToList, removeAnimeFromList, reorderListAnimes } = useLists();
const { searchAnimes } = useAnimes();

const list = ref<any>(null);
const loading = ref(true);
const showAddModal = ref(false);
const searchQuery = ref("");
const searchResults = ref<any[]>([]);
const searchLoading = ref(false);
const addError = ref("");
const reordering = ref(false);
const draggedAnimeId = ref<number | null>(null);
const dragOverAnimeId = ref<number | null>(null);

const animeCount = computed(() => list.value?.animes?.length || 0);

const PLACEHOLDER_COLORS = [
  { bg: "#3A3F52", fg: "#EDEBE4" },
  { bg: "#2F5D50", fg: "#E8F2EE" },
  { bg: "#5C4033", fg: "#F3E8DF" },
  { bg: "#35408C", fg: "#EEF0F8" },
  { bg: "#6B3A4A", fg: "#F8EBEF" },
];

onMounted(async () => {
  try {
    list.value = await fetchList(listId);
  } catch {
    list.value = null;
  } finally {
    loading.value = false;
  }
});

const animeIdOf = (item: any) => item?.animeId ?? item?.anime?.id;

const initials = (title?: string) =>
  (title || "?").replace(/[^A-Za-z0-9À-ÿ]/g, "").slice(0, 2).toUpperCase() || "?";

const colorForTitle = (title?: string) => {
  const s = title || "";
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash + s.charCodeAt(i) * (i + 1)) % 997;
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
};

const thumbBg = (anime: any) => colorForTitle(anime?.title).bg;
const thumbFg = (anime: any) => colorForTitle(anime?.title).fg;

const yearOf = (anime: any) => {
  if (!anime?.airedFrom) return null;
  const y = new Date(anime.airedFrom).getFullYear();
  return Number.isFinite(y) ? String(y) : null;
};

const metaLine = (anime: any) => {
  const parts = [yearOf(anime), anime?.studio].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Infos indisponibles";
};

const rowStyle = (animeId: number) => {
  const isOver = dragOverAnimeId.value === animeId && draggedAnimeId.value !== animeId;
  return [
    "display:flex",
    "align-items:center",
    "gap:12px",
    "padding:12px 14px",
    "border-radius:12px",
    `border:1px solid ${isOver ? "var(--color-accent-primary)" : "var(--border)"}`,
    "background:var(--bg-elevated)",
    "cursor:grab",
    "transition:border-color .12s ease,background .12s ease",
    isOver ? "background:rgba(192,25,43,0.06)" : "",
  ].join(";");
};

const persistOrder = async (orderedItems: any[], snapshot: any[]) => {
  reordering.value = true;
  list.value = { ...list.value, animes: orderedItems };
  try {
    const updated = await reorderListAnimes(
      listId,
      orderedItems.map((item: any) => animeIdOf(item)),
    );
    list.value = updated;
  } catch (e) {
    list.value = { ...list.value, animes: snapshot };
    console.error(e);
  } finally {
    reordering.value = false;
  }
};

const onDragStart = (animeId: number) => {
  draggedAnimeId.value = animeId;
};

const onDragOverItem = (animeId: number) => {
  if (draggedAnimeId.value === animeId) return;
  dragOverAnimeId.value = animeId;
};

const onDragEnd = () => {
  draggedAnimeId.value = null;
  dragOverAnimeId.value = null;
};

const onDropOnItem = async (targetId: number) => {
  if (!draggedAnimeId.value || draggedAnimeId.value === targetId || !list.value?.animes) {
    onDragEnd();
    return;
  }

  const items = [...list.value.animes];
  const sourceIndex = items.findIndex((item: any) => animeIdOf(item) === draggedAnimeId.value);
  const targetIndex = items.findIndex((item: any) => animeIdOf(item) === targetId);

  if (sourceIndex < 0 || targetIndex < 0) {
    onDragEnd();
    return;
  }

  const snapshot = [...items];
  const [moved] = items.splice(sourceIndex, 1);
  items.splice(targetIndex, 0, moved);
  await persistOrder(items, snapshot);
  onDragEnd();
};

const moveItem = async (index: number, delta: number) => {
  if (!list.value?.animes) return;
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= list.value.animes.length) return;

  const snapshot = [...list.value.animes];
  const items = [...list.value.animes];
  const [moved] = items.splice(index, 1);
  items.splice(targetIndex, 0, moved);
  await persistOrder(items, snapshot);
};

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
.list-action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-input);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}
.list-action-btn-alone {
  border: 1px solid var(--border);
  border-radius: 8px;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .list-row {
    flex-wrap: wrap !important;
    row-gap: 10px !important;
  }
  .list-row-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 2px;
  }
}
</style>
