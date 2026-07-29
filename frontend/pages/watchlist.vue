<template>
  <div class="watchlist-page" style="max-width:1180px;margin:0 auto;padding:24px 24px 40px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-0.01em;margin:0 0 14px;color:var(--text-primary)">
      Ma Watchlist
    </h1>

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div
      v-else-if="watchlist.length === 0"
      style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:64px 20px;text-align:center"
    >
      <BrandSeal :size="72" format="svg" style="opacity:0.25" />
      <div style="font-family:var(--font-display);font-weight:700;font-size:19px;color:var(--text-primary)">Aucun animé ici</div>
      <div style="font-size:14px;color:var(--text-secondary);max-width:380px">
        Ajoutez des animés depuis le catalogue pour suivre votre progression.
      </div>
      <NuxtLink
        to="/animes"
        class="at-btn-primary"
        style="padding:12px 24px;text-decoration:none;display:inline-flex;align-items:center"
      >
        Parcourir le catalogue
      </NuxtLink>
    </div>

    <div v-else class="watchlist-layout" style="display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start">
      <section style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 6px 10px">
          <div style="font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--text-primary)">
            Classement personnel
          </div>
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">
            {{ watchlist.length }} animé(s)
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px">
          <div
            v-for="(item, index) in watchlist"
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart(item.id)"
            @dragover.prevent="onDragOverItem(item.id)"
            @drop.prevent="onDropOnItem(item.id)"
            @dragend="onDragEnd"
            @click="selectedItemId = item.id"
            role="button"
            tabindex="0"
            @keydown.enter="selectedItemId = item.id"
            :style="`display:flex;gap:10px;padding:10px;border-radius:10px;border:1px solid ${selectedItemId === item.id ? 'var(--color-accent-primary)' : dragOverItemId === item.id ? 'var(--color-accent-secondary)' : 'var(--border)'};background:${selectedItemId === item.id ? 'rgba(192,25,43,0.08)' : 'var(--bg-input)'};cursor:grab`"
            class="at-list-row"
            :class="{ 'is-selected': selectedItemId === item.id }"
          >
            <div style="width:22px;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--text-tertiary);font-family:var(--font-mono);font-size:11px;line-height:1">
              <span>#{{ Number(index) + 1 }}</span>
              <span style="letter-spacing:1px">⋮⋮</span>
            </div>

            <div style="position:relative;width:54px;flex-shrink:0;aspect-ratio:2/3;border-radius:7px;overflow:hidden;background:var(--bg-elevated)">
              <img v-if="item.posterPath" :src="item.posterPath" :alt="item.title" style="width:100%;height:100%;object-fit:cover" />
              <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px">🎌</div>
            </div>

            <div style="flex:1;min-width:0;position:relative">
              <BrandSeal
                v-if="item.status === 'COMPLETED'"
                :size="34"
                format="svg"
                loading="eager"
                style="position:absolute;right:0;top:0;z-index:2;transform:rotate(-8deg);opacity:0.92;pointer-events:none"
              />
              <div :style="`font-size:14px;font-weight:600;color:var(--text-primary);line-height:1.25;display:-webkit-box;line-clamp:2;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding-right:${item.status === 'COMPLETED' ? '40px' : '0'}`">
                {{ item.title }}
              </div>
              <div style="margin-top:5px;font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)">
                {{ statusLabel(item.status) }} · {{ progressLabel(item) }} · {{ progressPercent(item) }}%
              </div>
              <div style="margin-top:6px;height:6px;background:var(--border);border-radius:999px;overflow:hidden">
                <div :style="`height:100%;width:${progressPercent(item)}%;background:var(--color-accent-primary);border-radius:999px`"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="watchlist-aside" style="position:sticky;top:74px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:14px">
        <template v-if="selectedItem">
          <img
            v-if="selectedItem.posterPath"
            :src="selectedItem.posterPath"
            :alt="selectedItem.title"
            style="width:100%;max-height:210px;object-fit:cover;border-radius:9px;border:1px solid var(--border)"
          />
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:18px;margin:12px 0 8px;color:var(--text-primary)">
            {{ selectedItem.title }}
          </h2>

          <label style="display:block;margin-bottom:12px">
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">Statut</div>
            <select
              :value="selectedItem.status"
              @change="updateStatus(($event.target as HTMLSelectElement).value)"
              style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px"
            >
              <option value="TO_WATCH">À voir</option>
              <option value="WATCHING">En cours</option>
              <option value="COMPLETED">Terminé</option>
              <option value="ON_HOLD">En pause</option>
            </select>
          </label>

          <label style="display:block;margin-bottom:4px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:13px;color:var(--text-secondary)">Progression</span>
              <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-primary)">
                {{ progressDraft }}/{{ totalEpisodes(selectedItem) || "?" }} · {{ progressPercentFromValue(progressDraft, selectedItem) }}%
              </span>
            </div>
            <input
              v-model.number="progressDraft"
              type="range"
              :min="0"
              :max="Math.max(1, totalEpisodes(selectedItem) || Math.max(progressDraft, 1))"
              step="1"
              style="width:100%;accent-color:var(--color-accent-primary)"
            />
          </label>

          <div class="watchlist-actions" style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
            <button
              @click="saveProgress"
              class="at-btn-primary"
              style="flex:1;min-width:140px;padding:10px;font-size:13px"
            >
              Enregistrer progression
            </button>
            <button
              @click="removeItem(selectedItem.id)"
              class="at-btn-secondary"
              style="padding:10px 12px;font-size:13px"
            >
              Retirer
            </button>
          </div>

          <NuxtLink
            :to="`/animes/${selectedItem.animeId}`"
            style="display:block;text-align:center;padding:10px;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);border-radius:8px;font-size:13px;text-decoration:none"
          >
            Ouvrir la fiche animé
          </NuxtLink>
        </template>

        <div v-else style="padding:18px 8px;text-align:center;color:var(--text-secondary);font-size:13px">
          Sélectionne un animé de la liste pour afficher le détail.
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWatchlist } from "../composables/useWatchlist";
import { io } from "socket.io-client";

declare const definePageMeta: any;
declare const useRuntimeConfig: any;
declare const useState: any;
declare const onMounted: any;
declare const onBeforeUnmount: any;
declare const ref: any;
declare const computed: any;
declare const watch: any;

definePageMeta({ middleware: "auth" });

const {
  watchlist,
  loading,
  fetchWatchlist,
  updateStatus: updateWatchlistStatus,
  updateProgress,
  removeFromWatchlist,
  reorderWatchlist,
} = useWatchlist();

const selectedItemId = ref(null as number | null);
const draggedItemId = ref(null as number | null);
const dragOverItemId = ref(null as number | null);
const progressDraft = ref(0);
const runtimeConfig = useRuntimeConfig();

let watchlistSocket: any = null;

onMounted(async () => {
  await fetchWatchlist();
  if (!selectedItemId.value && watchlist.value.length > 0) {
    selectedItemId.value = watchlist.value[0].id;
  }

  const token = useState("auth.token", () => "").value;
  if (!token) return;

  const baseUrl = String(runtimeConfig.public.apiBase || "http://localhost:3001/api");
  const socketUrl = baseUrl.replace(/\/api\/?$/, "");

  watchlistSocket = io(socketUrl, {
    transports: ["websocket"],
    auth: { token },
  });

  watchlistSocket.on("watchlist:changed", async () => {
    await fetchWatchlist();
  });
});

onBeforeUnmount(() => {
  if (watchlistSocket) {
    watchlistSocket.disconnect();
    watchlistSocket = null;
  }
});

const selectedItem = computed(() =>
  watchlist.value.find((item: any) => item.id === selectedItemId.value) || null,
);

watch(
  () => selectedItem.value,
  (item: any) => {
    progressDraft.value = Number(item?.progress || 0);
  },
  { immediate: true },
);

const statusLabel = (s: string) => {
  const labels: Record<string, string> = {
    TO_WATCH: "À voir",
    WATCHING: "En cours",
    COMPLETED: "Terminé",
    ON_HOLD: "En pause",
  };
  return labels[s] || s;
};

const totalEpisodes = (item: any) => Number(item?.anime?.episodes || 0);

const progressPercentFromValue = (progress: number, item: any) => {
  const total = totalEpisodes(item);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / total) * 100)));
};

const progressPercent = (item: any) =>
  progressPercentFromValue(Number(item?.progress || 0), item);

const progressLabel = (item: any) => {
  const current = Number(item?.progress || 0);
  const total = totalEpisodes(item);
  if (total > 0) return `${current}/${total} épisodes`;
  return `${current} épisode(s)`;
};

const onDragStart = (itemId: number) => {
  draggedItemId.value = itemId;
};

const onDragOverItem = (itemId: number) => {
  if (draggedItemId.value === itemId) return;
  dragOverItemId.value = itemId;
};

const onDragEnd = () => {
  draggedItemId.value = null;
  dragOverItemId.value = null;
};

const onDropOnItem = async (targetId: number) => {
  if (!draggedItemId.value || draggedItemId.value === targetId) {
    onDragEnd();
    return;
  }

  const sourceIndex = watchlist.value.findIndex((item: any) => item.id === draggedItemId.value);
  const targetIndex = watchlist.value.findIndex((item: any) => item.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0) {
    onDragEnd();
    return;
  }

  const snapshot = [...watchlist.value];
  const reordered = [...watchlist.value];
  const [moved] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  watchlist.value = reordered;

  try {
    await reorderWatchlist(reordered.map((item: any) => item.id));
  } catch (e) {
    watchlist.value = snapshot;
    await fetchWatchlist();
    console.error(e);
  } finally {
    onDragEnd();
  }
};

const updateStatus = async (newStatus: string) => {
  if (!selectedItem.value) return;
  try {
    await updateWatchlistStatus(selectedItem.value.id, newStatus);
    await fetchWatchlist();
  } catch (e) {
    console.error(e);
  }
};

const saveProgress = async () => {
  if (!selectedItem.value) return;
  try {
    await updateProgress(selectedItem.value.id, Number(progressDraft.value || 0));
    await fetchWatchlist();
  } catch (e) {
    console.error(e);
  }
};

const removeItem = async (id: number) => {
  try {
    await removeFromWatchlist(id);
    if (selectedItemId.value === id) {
      selectedItemId.value = watchlist.value[0]?.id ?? null;
    }
  } catch (e) {
    console.error(e);
  }
};
</script>

<style scoped>
@media (max-width: 1023px) {
  .watchlist-page {
    padding: 16px 14px 30px !important;
  }
  .watchlist-layout {
    grid-template-columns: 1fr !important;
  }
  .watchlist-aside {
    position: static !important;
    top: auto !important;
  }
  .watchlist-actions > button {
    flex: 1 1 100%;
  }
}
</style>
