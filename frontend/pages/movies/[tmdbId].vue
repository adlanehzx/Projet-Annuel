<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-4xl mx-auto">
      <NuxtLink
        to="/watchlist"
        class="text-amber-500 hover:text-amber-400 mb-6 inline-block"
      >
        ← Retour à ma watchlist
      </NuxtLink>

      <div v-if="loading" class="text-center py-12">
        <p class="text-slate-400">Chargement...</p>
      </div>

      <div v-else-if="movie && watchlistItem">
        <!-- Header with poster and basic info -->
        <div class="flex flex-col md:flex-row gap-8 mb-8">
          <!-- Poster -->
          <div class="flex-shrink-0">
            <img
              v-if="movie.poster_path"
              :src="`https://image.tmdb.org/t/p/w342${movie.poster_path}`"
              :alt="movie.title"
              class="w-48 rounded-lg shadow-lg"
            />
            <div
              v-else
              class="w-48 h-72 bg-slate-700 rounded-lg flex items-center justify-center"
            >
              Pas d'affiche
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-4xl font-bold mb-2">{{ movie.title }}</h1>
            <p class="text-slate-400 mb-4">
              {{
                movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "Année inconnue"
              }}
            </p>

            <!-- Rating -->
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-2xl font-bold text-amber-500">{{
                  (movie.vote_average / 2).toFixed(1)
                }}</span>
                <span class="text-slate-400"
                  >/5 ({{ movie.vote_count }} votes)</span
                >
              </div>
              <div class="flex gap-1">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="[
                    'text-xl',
                    i <= Math.round(movie.vote_average / 2)
                      ? 'text-amber-500'
                      : 'text-slate-600',
                  ]"
                  >★</span
                >
              </div>
            </div>

            <!-- Overview -->
            <p class="text-slate-300 mb-6 line-clamp-4">{{ movie.overview }}</p>

            <!-- Genres -->
            <div class="mb-6">
              <p class="text-slate-400 text-sm mb-2">Genres</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in movie.genres"
                  :key="genre.id"
                  class="bg-slate-700 px-3 py-1 rounded-full text-sm"
                >
                  {{ genre.name }}
                </span>
              </div>
            </div>

            <!-- Watchlist Status -->
            <div class="bg-slate-800 p-4 rounded-lg mb-6">
              <p class="text-slate-400 text-sm mb-2">
                Statut dans ma watchlist
              </p>
              <select
                :value="watchlistItem.status"
                @change="updateStatus($event.target.value)"
                class="bg-slate-700 text-white px-4 py-2 rounded w-full mb-4"
              >
                <option value="TO_WATCH">À voir</option>
                <option value="WATCHING">En cours</option>
                <option value="COMPLETED">Terminé</option>
              </select>
              <button
                @click="removeFromWatchlist"
                class="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition"
              >
                Retirer de ma watchlist
              </button>
            </div>
          </div>
        </div>

        <hr class="border-slate-700 my-8" />

        <!-- Reviews Section -->
        <div>
          <h2 class="text-2xl font-bold mb-6">Mes avis</h2>

          <!-- My Review Form -->
          <div class="bg-slate-800 p-6 rounded-lg mb-8">
            <h3 class="text-lg font-semibold mb-4">Mon avis personnel</h3>

            <div class="mb-4">
              <p class="text-slate-400 text-sm mb-2">Ma note (0-10)</p>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="myReview.rating"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  class="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span
                  class="text-2xl font-bold text-amber-500 w-12 text-right"
                  >{{ myReview.rating }}</span
                >
              </div>
            </div>

            <div class="mb-4">
              <label class="text-slate-400 text-sm mb-2 block"
                >Commentaire</label
              >
              <textarea
                v-model="myReview.comment"
                placeholder="Qu'en as-tu pensé?"
                class="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-amber-500 focus:outline-none resize-none h-32"
              />
            </div>

            <button
              @click="saveReview"
              :disabled="reviewLoading"
              class="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 px-6 py-2 rounded font-semibold transition"
            >
              {{ myReview.id ? "Mettre à jour mon avis" : "Publier mon avis" }}
            </button>
          </div>

          <!-- Community Reviews -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Avis de la communauté</h3>
            <div v-if="communityReviews.length > 0" class="space-y-4">
              <div
                v-for="review in communityReviews"
                :key="review.id"
                class="bg-slate-800 p-4 rounded-lg"
              >
                <div class="flex justify-between items-start mb-2">
                  <p class="font-semibold">
                    {{ review.user?.username || "Anonyme" }}
                  </p>
                  <span class="text-amber-500 font-bold"
                    >{{ review.rating }}/10</span
                  >
                </div>
                <p class="text-slate-300 text-sm">
                  {{ review.comment || "Aucun commentaire" }}
                </p>
              </div>
            </div>
            <div v-else class="text-slate-400 text-center py-8">
              Aucun avis pour le moment
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-red-400">Film non trouvé</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTmdb } from "~/composables/useTmdb";
import { useWatchlist } from "~/composables/useWatchlist";
import { useReviews } from "~/composables/useReviews";

const route = useRoute();
const router = useRouter();
const tmdbId = parseInt(route.params.tmdbId as string);

const { getMovieDetails } = useTmdb();
const { getWatchlistItem } = useWatchlist();
const { getReview, getMovieReviews, createOrUpdateReview, deleteReview } =
  useReviews();

const movie = ref(null);
const watchlistItem = ref(null);
const myReview = ref({ id: null, rating: 0, comment: "" });
const communityReviews = ref([]);
const loading = ref(true);
const reviewLoading = ref(false);

onMounted(async () => {
  try {
    // Get movie details from TMDB
    movie.value = await getMovieDetails(tmdbId);

    // Get watchlist item
    watchlistItem.value = getWatchlistItem.value(tmdbId);
    if (!watchlistItem.value) {
      await router.push("/watchlist");
      return;
    }

    // Get my review
    const myReviewData = await getReview(watchlistItem.value.id);
    if (myReviewData) {
      myReview.value = myReviewData;
    }

    // Get community reviews
    communityReviews.value = await getMovieReviews(watchlistItem.value.id);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    loading.value = false;
  }
});

const updateStatus = async (newStatus: string) => {
  try {
    const { updateStatus: updateWatchlistStatus } = useWatchlist();
    await updateWatchlistStatus(watchlistItem.value.id, newStatus);
    watchlistItem.value.status = newStatus;
  } catch (e) {
    console.error("Erreur:", e);
  }
};

const saveReview = async () => {
  try {
    reviewLoading.value = true;
    await createOrUpdateReview(
      watchlistItem.value.id,
      myReview.value.rating,
      myReview.value.comment,
    );
    // Reload community reviews
    communityReviews.value = await getMovieReviews(watchlistItem.value.id);
  } catch (e) {
    console.error("Erreur:", e);
  } finally {
    reviewLoading.value = false;
  }
};

const removeFromWatchlist = async () => {
  try {
    const { removeFromWatchlist: removeItem } = useWatchlist();
    await removeItem(watchlistItem.value.id);
    await router.push("/watchlist");
  } catch (e) {
    console.error("Erreur:", e);
  }
};
</script>
