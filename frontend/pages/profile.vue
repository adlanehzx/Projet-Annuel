<template>
  <div style="max-width:1000px;margin:0 auto;padding:24px 24px 48px;width:100%">

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <template v-else>
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--color-accent-secondary);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:24px;letter-spacing:-0.01em;flex-shrink:0;overflow:hidden">
          <img v-if="avatarSrc" :src="avatarSrc" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />
          <template v-else>{{ (user?.username || '?').slice(0, 2).toUpperCase() }}</template>
        </div>
        <div style="flex:1;min-width:200px">
          <div style="font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--text-primary)">{{ user?.username }}</div>
          <div style="font-size:14px;color:var(--text-secondary);margin-top:4px">Membre depuis {{ joinDate }}</div>

          <div style="margin-top:12px">
            <p v-if="bio" style="margin:0;font-size:14px;line-height:1.55;color:var(--text-primary);white-space:pre-wrap">{{ bio }}</p>
            <p v-else style="margin:0;font-size:14px;color:var(--text-tertiary);font-style:italic">Aucune description pour le moment.</p>
            <NuxtLink
              to="/settings"
              class="at-link-accent"
              style="display:inline-block;margin-top:10px;font-size:13px"
            >
              {{ bio ? "Modifier la description" : "Ajouter une description" }}
            </NuxtLink>
          </div>
        </div>
        <NuxtLink to="/settings" class="at-btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center">Paramètres</NuxtLink>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-top:16px">
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ stats.animeCount }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Animés vus</div>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ stats.episodeCount }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Épisodes</div>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ stats.averageRating.toFixed(1) }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Note moy.</div>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;padding:18px 12px;text-align:center">
          <div style="font-family:var(--font-mono);font-size:26px;line-height:1.2;color:var(--text-primary)">{{ stats.reviewCount }}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:5px">Reviews</div>
        </div>
      </div>

      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;margin-top:16px">
        <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 18px;color:var(--text-primary)">Top genres</h2>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div v-for="genre in topGenres" :key="genre.name" style="display:flex;align-items:center;gap:12px">
            <span style="width:110px;font-size:13px;flex-shrink:0;color:var(--text-secondary)">{{ genre.name }}</span>
            <div style="flex:1;height:18px;background:var(--bg);border-radius:4px;overflow:hidden">
              <div :style="`width:${(genre.count / (topGenres[0]?.count || 1)) * 100}%;height:100%;background:var(--color-accent-secondary);transition:width 0.3s`"></div>
            </div>
            <span style="width:38px;text-align:right;font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">{{ genre.count }}</span>
          </div>
        </div>
      </div>

      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:26px 0 12px;color:var(--text-primary)">Reviews récentes</h2>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div v-for="review in recentReviews" :key="review.id" style="display:flex;align-items:center;gap:12px;padding:13px 16px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px">
          <span style="font-size:14px;flex:1;min-width:0;color:var(--text-primary)">{{ review.watchlistItem?.anime?.title || 'Animé' }} — <span style="font-family:var(--font-mono);color:var(--rating)">★ {{ review.rating }}/10</span></span>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary);flex-shrink:0">{{ formatDate(review.createdAt) }}</span>
        </div>
        <div v-if="recentReviews.length === 0" style="padding:28px;border:1px dashed var(--border);border-radius:10px;text-align:center;color:var(--text-secondary);font-size:14px">
          Aucune review pour l'instant.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";
import { useApi } from "~/composables/useApi";
// @ts-ignore
import { io } from "socket.io-client";

definePageMeta({ middleware: "auth" });

const { user, getMyProfile } = useAuth();
const { resolve: resolveAvatarUrl } = useAvatarUrl();
const avatarSrc = computed(() => resolveAvatarUrl(user.value?.avatar));
const api = useApi();

const loading = ref(true);
const memberSince = ref<string | null>(null);
const stats = ref({ animeCount: 0, episodeCount: 0, averageRating: 0, reviewCount: 0 });
const topGenres = ref<any[]>([]);
const recentReviews = ref<any[]>([]);
const bio = ref("");
const runtimeConfig = useRuntimeConfig();
let profileSocket: any = null;

const loadProfileStats = async () => {
  const [statsRes, genresRes] = await Promise.all([
    api.get("/statistics/me"),
    api.get("/statistics/genres"),
  ]);

  stats.value = {
    animeCount: statsRes.data?.watchlist?.completed || 0,
    episodeCount: statsRes.data?.watchlist?.total || 0,
    averageRating: statsRes.data?.reviews?.averageRating || 0,
    reviewCount: statsRes.data?.reviews?.total || 0,
  };

  topGenres.value = Array.isArray(genresRes.data)
    ? genresRes.data.slice(0, 6)
    : [];
};

const loadRecentReviews = async () => {
  if (!user.value?.username) {
    recentReviews.value = [];
    return;
  }

  const reviewsRes = await api.get(
    `/profiles/${encodeURIComponent(user.value.username)}/reviews?limit=3`,
  );
  recentReviews.value = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
};

const loadBio = async () => {
  const profile = await getMyProfile();
  bio.value = profile.bio || "";
  memberSince.value = profile.createdAt || null;
};

const refreshAllProfileData = async () => {
  try {
    await Promise.all([loadProfileStats(), loadRecentReviews()]);
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  try {
    await Promise.all([refreshAllProfileData(), loadBio()]);

    const token = useState("auth.token", () => "").value;
    if (token) {
      const baseUrl = String(runtimeConfig.public.apiBase || "http://localhost:3001/api");
      const socketUrl = baseUrl.replace(/\/api\/?$/, "");

      profileSocket = io(socketUrl, {
        transports: ["websocket"],
        auth: { token },
      });

      profileSocket.on("watchlist:changed", refreshAllProfileData);
      profileSocket.on("profile:stats-updated", refreshAllProfileData);
    }
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});

onBeforeUnmount(() => {
  if (profileSocket) {
    profileSocket.off("watchlist:changed", refreshAllProfileData);
    profileSocket.off("profile:stats-updated", refreshAllProfileData);
    profileSocket.disconnect();
    profileSocket = null;
  }
});

const joinDate = computed(() => {
  const raw = memberSince.value || user.value?.createdAt;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });
});

const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { year: "2-digit", month: "numeric", day: "numeric" });
</script>
