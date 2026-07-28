<template>
  <div style="max-width:1000px;margin:0 auto;padding:24px 24px 48px;width:100%">

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else-if="!profile" style="text-align:center;padding:64px;color:var(--color-accent-primary)">
      {{ error || "Profil introuvable" }}
    </div>

    <template v-else>
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;display:flex;gap:20px;align-items:center;flex-wrap:wrap">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--color-accent-secondary);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:24px;flex-shrink:0">
          {{ (profile.username || '?').slice(0, 2).toUpperCase() }}
        </div>
        <div style="flex:1;min-width:200px">
          <div style="font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--text-primary)">{{ profile.username }}</div>
          <div v-if="profile.bio" style="font-size:14px;color:var(--text-secondary);margin-top:6px">{{ profile.bio }}</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">Membre depuis {{ joinDate }}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-top:16px">
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ statistics.completedAnimes }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Animes vus</div>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ statistics.reviewsCount }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Reviews</div>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ statistics.averageRating.toFixed(1) }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Note moy.</div>
        </div>
      </div>

      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:26px 0 12px;color:var(--text-primary)">Listes publiques</h2>
      <div v-if="publicLists.length > 0" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
        <div
          v-for="list in publicLists"
          :key="list.id"
          role="button"
          tabindex="0"
          @click="navigateTo(`/lists/${list.id}`)"
          @keydown.enter="navigateTo(`/lists/${list.id}`)"
          style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:14px 16px;cursor:pointer"
        >
          <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--text-primary)">{{ list.title }}</div>
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary);margin-top:6px">{{ (list.animes || []).length }} anime{{ (list.animes || []).length !== 1 ? 's' : '' }}</div>
        </div>
      </div>
      <div v-else style="padding:20px;border:1px dashed var(--border);border-radius:10px;text-align:center;color:var(--text-secondary);font-size:14px">
        Aucune liste publique.
      </div>

      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:26px 0 12px;color:var(--text-primary)">Reviews récentes</h2>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div v-for="review in reviews" :key="review.id" style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px">
          <span style="font-size:14px;flex:1;min-width:0;color:var(--text-primary)">{{ review.watchlistItem?.anime?.title || 'Anime' }} — <span style="font-family:var(--font-mono);color:var(--color-accent-primary)">★ {{ review.rating }}/10</span></span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary);flex-shrink:0">{{ formatDate(review.createdAt) }}</span>
        </div>
        <div v-if="reviews.length === 0" style="padding:28px;border:1px dashed var(--border);border-radius:10px;text-align:center;color:var(--text-secondary);font-size:14px">
          Aucune review pour l'instant.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useApi } from "~/composables/useApi";

const route = useRoute();
const api = useApi();

const loading = ref(true);
const error = ref("");
const profile = ref<any>(null);
const statistics = ref({ completedAnimes: 0, reviewsCount: 0, averageRating: 0 });
const publicLists = ref<any[]>([]);
const reviews = ref<any[]>([]);

onMounted(async () => {
  const username = route.params.username as string;
  try {
    const profileRes = await api.get(`/profiles/${encodeURIComponent(username)}`);
    profile.value = profileRes.data.profile;
    statistics.value = profileRes.data.statistics;
    publicLists.value = profileRes.data.publicLists || [];

    const reviewsRes = await api.get(
      `/profiles/${encodeURIComponent(username)}/reviews?limit=10`,
    );
    reviews.value = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
  } catch (e: any) {
    error.value = e.response?.data?.error || "Profil introuvable";
  } finally {
    loading.value = false;
  }
});

const joinDate = computed(() => {
  if (!profile.value?.createdAt) return "?";
  return new Date(profile.value.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
});

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { year: "2-digit", month: "numeric", day: "numeric" });
</script>
