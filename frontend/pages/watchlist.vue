<template>
  <div style="max-width:1200px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0 0 14px;color:var(--text-primary)">Ma Watchlist</h1>

    <div style="display:flex;gap:2px;border-bottom:1px solid var(--border);overflow-x:auto;margin-bottom:0">
      <button
        v-for="tab in tabs"
        :key="tab.status"
        @click="activeStatus = tab.status"
        :style="`padding:10px 18px;background:none;border:none;border-bottom:2px solid ${activeStatus===tab.status?'var(--color-accent-primary)':'transparent'};color:${activeStatus===tab.status?'var(--color-accent-primary)':'var(--text-secondary)'};font-family:var(--font-body);font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap`"
      >{{ tab.label }} ({{ countByStatus(tab.status) }})</button>
    </div>

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="filteredWatchlist.length === 0" style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:64px 20px;text-align:center">
      <BrandSeal :size="72" format="svg" style="opacity:0.25" />
      <div style="font-family:var(--font-display);font-weight:700;font-size:19px;color:var(--text-primary)">Aucun anime ici</div>
      <div style="font-size:14px;color:var(--text-secondary);max-width:380px">Ajoutez des animes depuis le catalogue pour suivre votre progression.</div>
      <NuxtLink to="/animes" style="padding:12px 24px;background:var(--color-accent-primary);color:#fff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Parcourir le catalogue</NuxtLink>
    </div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:20px;margin-top:22px">
      <div v-for="item in filteredWatchlist" :key="item.id">
        <div
          role="button"
          tabindex="0"
          @click="selectedItem = item"
          @keydown.enter="selectedItem = item"
          style="cursor:pointer"
        >
          <div style="position:relative;aspect-ratio:2/3;border-radius:8px;overflow:hidden;background:var(--bg-elevated);border:1px solid var(--border)">
            <img v-if="item.posterPath" :src="item.posterPath" :alt="item.title" style="width:100%;height:100%;object-fit:cover" />
            <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🎌</div>
            <div
              v-if="item.status === 'COMPLETED'"
              style="position:absolute;inset:0;pointer-events:none;z-index:1;background:rgba(0,0,0,0.24)"
            />
            <BrandSeal
              v-if="item.status === 'COMPLETED'"
              :size="56"
              format="png"
              style="position:absolute;right:8px;bottom:8px;z-index:2;transform:rotate(-7deg);opacity:0.9"
            />
          </div>
          <div style="margin-top:8px;font-size:14px;font-weight:500;line-height:1.3;color:var(--text-primary)">{{ item.title }}</div>
          <div style="margin-top:3px;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">{{ statusLabel(item.status) }}</div>
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
import { useWatchlist } from "~/composables/useWatchlist";

definePageMeta({ middleware: "auth" });

const { watchlist, loading, fetchWatchlist, updateStatus: updateWatchlistStatus, removeFromWatchlist } = useWatchlist();
const activeStatus = ref("TO_WATCH");
const selectedItem = ref<any>(null);

onMounted(() => fetchWatchlist());

const tabs = [
  { status: "TO_WATCH", label: "À voir" },
  { status: "WATCHING", label: "En cours" },
  { status: "COMPLETED", label: "Terminé" },
  { status: "DROPPED", label: "Abandonné" },
  { status: "ON_HOLD", label: "En pause" },
];

const statusLabel = (s: string) => tabs.find(t => t.status === s)?.label ?? s;
const countByStatus = (s: string) => watchlist.value.filter((w: any) => w.status === s).length;
const filteredWatchlist = computed(() => watchlist.value.filter((w: any) => w.status === activeStatus.value));

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
