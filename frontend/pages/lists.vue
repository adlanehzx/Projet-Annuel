<template>
  <div style="max-width:1100px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap">
      <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0;color:var(--text-primary)">Mes listes</h1>
      <NuxtLink to="/lists/new" style="padding:12px 24px;background:var(--color-accent-primary);color:#fff;border-radius:8px;font-weight:600;font-size:15px;text-decoration:none">+ Créer une liste</NuxtLink>
    </div>

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px">
      <div
        v-for="list in lists"
        :key="list.id"
        role="button"
        tabindex="0"
        @click="navigateTo(`/lists/${list.id}`)"
        @keydown.enter="navigateTo(`/lists/${list.id}`)"
        style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:box-shadow 0.2s"
      >
        <div style="display:flex;height:110px;background:var(--bg)">
          <div v-for="(item, idx) in list.animes.slice(0, 4)" :key="idx" style="flex:1;overflow:hidden;border-right:1px solid var(--border);background:linear-gradient(135deg,var(--bg),var(--bg-elevated))">
            <img v-if="item.posterPath" :src="item.posterPath" :alt="item.title" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <template v-for="_ in Math.max(0, 4 - list.animes.length)" :key="'empty-' + _">
            <div style="flex:1;border-right:1px solid var(--border)"></div>
          </template>
        </div>

        <div style="padding:14px 16px">
          <div style="font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--text-primary)">{{ list.title }}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:7px">
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">{{ list.animes.length }} anime{{ list.animes.length !== 1 ? 's' : '' }}</span>
            <span style="padding:3px 8px;background:var(--color-accent-secondary);color:#fff;border-radius:999px;font-family:var(--font-mono);font-size:11px;font-weight:600">{{ list.isPublic ? 'Public' : 'Privé' }}</span>
          </div>
        </div>
      </div>

      <NuxtLink to="/lists/new" style="border:2px dashed var(--border);border-radius:12px;min-height:180px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:14px;cursor:pointer;text-decoration:none">+ Nouvelle liste</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCollections } from "~/composables/useCollections";

definePageMeta({ middleware: "auth" });

const { lists, loading, fetchCollections } = useCollections();

onMounted(() => fetchCollections());
</script>
