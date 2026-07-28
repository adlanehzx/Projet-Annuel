<template>
  <div style="max-width:1200px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0 0 14px;color:var(--text-primary)">Recommandations pour vous</h1>
    <p style="font-size:14px;color:var(--text-secondary);margin:0 0 24px;max-width:580px">Basé sur vos animes vus, vos notes et vos listes</p>

    <div v-if="loading" style="text-align:center;padding:64px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="recommendations.length === 0" style="text-align:center;padding:64px;color:var(--text-secondary)">
      Revenez bientôt ! Notez au moins un anime 7/10 ou plus pour débloquer des recommandations personnalisées basées sur vos goûts.
    </div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px">
      <div
        v-for="item in recommendations"
        :key="item.id"
        role="button"
        tabindex="0"
        @click="navigateTo(`/animes/${item.id}`)"
        @keydown.enter="navigateTo(`/animes/${item.id}`)"
        style="cursor:pointer;border-radius:8px"
      >
        <div style="position:relative;aspect-ratio:2/3;border-radius:8px;overflow:hidden;background:var(--bg-elevated);border:1px solid var(--border)">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" style="width:100%;height:100%;object-fit:cover;transition:opacity 0.2s" />
          <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🎌</div>
        </div>
        <div style="margin-top:8px;font-size:14px;font-weight:500;line-height:1.3;color:var(--text-primary)">{{ item.title }}</div>
        <div style="margin-top:3px;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">★ {{ item.score?.toFixed(1) ?? '—' }}</div>
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
