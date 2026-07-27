<template>
  <div style="max-width:1200px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0 0 14px;color:var(--text-primary)">Ma Watchlist</h1>

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="watchlist.length === 0" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:64px 20px;text-align:center">
      <BrandSeal :size="72" format="svg" style="opacity:0.25" />
      <div style="font-family:var(--font-display);font-weight:700;font-size:19px;color:var(--text-primary)">Aucun anime ici</div>
      <div style="font-size:14px;color:var(--text-secondary);max-width:380px">Ajoutez des animes depuis le catalogue pour suivre votre progression.</div>
      <NuxtLink to="/animes" style="padding:12px 24px;background:var(--color-accent-primary);color:#fff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Parcourir le catalogue</NuxtLink>
    </div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:18px">
      <div
        v-for="tab in tabs"
        :key="tab.status"
        @dragover.prevent="onDragOver(tab.status)"
        @dragleave="onDragLeave(tab.status)"
        @drop.prevent="onDrop(tab.status)"
        :style="`border:1px solid ${dragOverStatus===tab.status?'var(--color-accent-primary)':'var(--border)'};border-radius:12px;padding:10px;background:var(--bg-elevated);min-height:220px;transition:border-color .15s ease`"
      >
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--text-primary)">{{ tab.label }}</div>
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">{{ countByStatus(tab.status) }}</div>
        </div>

        <div v-if="itemsByStatus(tab.status).length === 0" style="padding:14px;border:1px dashed var(--border);border-radius:8px;color:var(--text-secondary);font-size:12px;text-align:center">
          Glisse un anime ici
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          <div
            v-for="item in itemsByStatus(tab.status)"
            :key="item.id"
            draggable="true"
            @dragstart="onDragStart(item.id)"
            @dragend="onDragEnd"
            role="button"
            tabindex="0"
            @click="selectedItem = item"
            @keydown.enter="selectedItem = item"
            style="cursor:grab;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:8px"
          >
            <div style="display:flex;gap:8px;align-items:flex-start">
              <div style="position:relative;width:52px;flex-shrink:0;aspect-ratio:2/3;border-radius:6px;overflow:hidden;background:var(--bg-elevated)">
                <img v-if="item.posterPath" :src="item.posterPath" :alt="item.title" style="width:100%;height:100%;object-fit:cover" />
                <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px">🎌</div>
              </div>
              <div style="min-width:0;flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);line-height:1.25;display:-webkit-box;line-clamp:2;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ item.title }}</div>
                <div style="margin-top:4px;font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)">
                  {{ progressLabel(item) }}
                </div>
                <div v-if="updatingItemId === item.id" style="margin-top:4px;font-size:11px;color:var(--color-accent-primary)">
                  Mise à jour…
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="at-fade">
        <div v-if="selectedItem" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50" @click.self="selectedItem=null">
          <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;max-width:580px;width:100%;max-height:90vh;overflow-y:auto;position:relative">
            <button @click="selectedItem=null" style="position:absolute;top:14px;right:14px;background:none;border:none;color:var(--text-secondary);font-size:20px;cursor:pointer;line-height:1">✕</button>
            <div style="display:flex;gap:20px;padding:24px">
              <img v-if="selectedItem.posterPath" :src="selectedItem.posterPath" :alt="selectedItem.title" style="width:110px;border-radius:8px;object-fit:cover;flex-shrink:0" />
              <div style="flex:1;min-width:0">
                <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin:0 0 8px;color:var(--text-primary)">{{ selectedItem.title }}</h2>
                <div style="margin-bottom:16px">
                  <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">Statut</div>
                  <select :value="selectedItem.status" @change="updateStatus(($event.target as HTMLSelectElement).value)" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px">
                    <option value="TO_WATCH">À voir</option>
                    <option value="WATCHING">En cours</option>
                    <option value="COMPLETED">Terminé</option>
                    <option value="DROPPED">Abandonné</option>
                    <option value="ON_HOLD">En pause</option>
                  </select>
                </div>
                <div style="display:flex;gap:10px">
                  <NuxtLink :to="`/animes/${selectedItem.animeId}`" @click="selectedItem=null" style="flex:1;padding:10px;background:var(--color-accent-primary);color:#fff;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;text-align:center">Détail & Avis</NuxtLink>
                  <button @click="removeItem(selectedItem.id)" style="padding:10px 14px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:8px;font-size:13px;cursor:pointer">Retirer</button>
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
import { useWatchlist } from "../composables/useWatchlist";
import { io } from "socket.io-client";

// Nuxt auto-imports these at runtime; declare them for TS when Nuxt types are unavailable.
declare const definePageMeta: any;
declare const useRuntimeConfig: any;
declare const useState: any;
declare const onMounted: any;
declare const onBeforeUnmount: any;
declare const ref: any;

definePageMeta({ middleware: "auth" });

const { watchlist, loading, fetchWatchlist, updateStatus: updateWatchlistStatus, removeFromWatchlist } = useWatchlist();
const selectedItem = ref(null as any);
const draggedItemId = ref(null as number | null);
const dragOverStatus = ref(null as string | null);
const updatingItemId = ref(null as number | null);
const runtimeConfig = useRuntimeConfig();

let watchlistSocket: any = null;

onMounted(async () => {
  await fetchWatchlist();

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

const tabs = [
  { status: "TO_WATCH", label: "À voir" },
  { status: "WATCHING", label: "En cours" },
  { status: "COMPLETED", label: "Terminé" },
  { status: "DROPPED", label: "Abandonné" },
  { status: "ON_HOLD", label: "En pause" },
];

const statusLabel = (s: string) => tabs.find(t => t.status === s)?.label ?? s;
const countByStatus = (s: string) => watchlist.value.filter((w: any) => w.status === s).length;
const itemsByStatus = (status: string) =>
  watchlist.value.filter((w: any) => w.status === status);

const progressLabel = (item: any) => {
  const current = Number(item.progress || 0);
  const total = Number(item.anime?.episodes || 0);

  if (total > 0) {
    return `${current}/${total} épisodes`;
  }

  return `${current} épisode(s)`;
};

const onDragStart = (itemId: number) => {
  draggedItemId.value = itemId;
};

const onDragOver = (status: string) => {
  dragOverStatus.value = status;
};

const onDragLeave = (status: string) => {
  if (dragOverStatus.value === status) {
    dragOverStatus.value = null;
  }
};

const onDragEnd = () => {
  draggedItemId.value = null;
  dragOverStatus.value = null;
};

const onDrop = async (status: string) => {
  if (!draggedItemId.value) return;

  const item = watchlist.value.find((w: any) => w.id === draggedItemId.value);
  if (!item || item.status === status) {
    onDragEnd();
    return;
  }

  try {
    updatingItemId.value = item.id;
    await updateWatchlistStatus(item.id, status);
    await fetchWatchlist();
  } catch (e) {
    console.error(e);
  } finally {
    updatingItemId.value = null;
    onDragEnd();
  }
};

const updateStatus = async (newStatus: string) => {
  if (!selectedItem.value) return;
  try {
    await updateWatchlistStatus(selectedItem.value.id, newStatus);
    selectedItem.value = null;
    await fetchWatchlist();
  } catch (e) { console.error(e); }
};

const removeItem = async (id: number) => {
  try {
    await removeFromWatchlist(id);
    selectedItem.value = null;
  } catch (e) { console.error(e); }
};
</script>

<style scoped>
.at-fade-enter-active, .at-fade-leave-active { transition: opacity 0.2s ease; }
.at-fade-enter-from, .at-fade-leave-to { opacity: 0; }
</style>
