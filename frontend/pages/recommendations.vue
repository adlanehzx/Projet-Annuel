<template>
  <div style="max-width:1200px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0 0 14px;color:var(--text-primary)">Recommandations pour vous</h1>
    <p style="font-size:14px;color:var(--text-secondary);margin:0 0 24px;max-width:580px">Basé sur vos animes vus, vos notes et vos listes</p>

    <div v-if="loading" style="text-align:center;padding:64px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="recommendations.length === 0" style="text-align:center;padding:64px;color:var(--text-secondary)">
      Revenez bientôt ! Ajoutez plus d'animes à votre watchlist pour des recommandations personnalisées.
    </div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px">
      <div
        v-for="item in recommendations"
        :key="item.anime.id"
        role="button"
        tabindex="0"
        @click="navigateTo(`/animes/${item.anime.id}`)"
        @keydown.enter="navigateTo(`/animes/${item.anime.id}`)"
        style="cursor:pointer;border-radius:8px"
      >
        <!-- Poster avec score de reco -->
        <div style="position:relative;aspect-ratio:2/3;border-radius:8px;overflow:hidden;background:var(--bg-elevated);border:1px solid var(--border)">
          <img v-if="item.anime.imageUrl" :src="item.anime.imageUrl" :alt="item.anime.title" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s" />
          <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🎌</div>
          <!-- Badge score reco -->
          <div style="position:absolute;top:8px;right:8px;background:var(--color-accent-primary);color:#fff;padding:4px 10px;border-radius:999px;font-family:var(--font-mono);font-size:11px;font-weight:700;opacity:0.95">
            {{ (item.score * 100).toFixed(0) }}%
          </div>
        </div>
        <div style="margin-top:8px;font-size:14px;font-weight:500;line-height:1.3;color:var(--text-primary)">{{ item.anime.title }}</div>
        <div style="margin-top:3px;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">★ {{ item.anime.score?.toFixed(1) ?? '—' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from "~/composables/useApi";

definePageMeta({ middleware: "auth" });

const api = useApi();
const loading = ref(true);
const recommendations = ref<any[]>([]);

onMounted(async () => {
  try {
    const res = await api.get("/recommendations");
    recommendations.value = res.data || [];
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});
</script>
