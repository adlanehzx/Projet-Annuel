import { ref, computed } from "vue";
import { useApi } from "./useApi";

const watchlist = ref([]);
const loading = ref(false);
const error = ref("");

export const useWatchlist = () => {
  const api = useApi();

  const fetchWatchlist = async (status?: string) => {
    try {
      loading.value = true;
      error.value = "";
      const url = status ? `/watchlist/status/${status}` : "/watchlist";
      const response = await api.get(url);
      watchlist.value = response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors du chargement";
    } finally {
      loading.value = false;
    }
  };

  const addToWatchlist = async (animeId: number) => {
    try {
      loading.value = true;
      const response = await api.post("/watchlist", {
        animeId,
        status: "TO_WATCH",
      });
      watchlist.value.unshift(response.data);
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de l'ajout";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const response = await api.put(`/watchlist/${id}/status`, { status });
      const index = watchlist.value.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        watchlist.value[index] = response.data;
      }
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la mise à jour";
      throw e;
    }
  };

  const updateProgress = async (id: number, progress: number) => {
    try {
      const response = await api.put(`/watchlist/${id}/progress`, { progress });
      const index = watchlist.value.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        watchlist.value[index] = response.data;
      }
      return response.data;
    } catch (e: any) {
      error.value =
        e.response?.data?.error || "Erreur lors de la mise à jour de la progression";
      throw e;
    }
  };

  const removeFromWatchlist = async (id: number) => {
    try {
      await api.del(`/watchlist/${id}`);
      watchlist.value = watchlist.value.filter((item: any) => item.id !== id);
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la suppression";
      throw e;
    }
  };

  const isInWatchlist = computed(() => (animeId: number) => {
    return watchlist.value.some((item: any) => item.animeId === animeId);
  });

  const getWatchlistItem = computed(() => (animeId: number) => {
    return watchlist.value.find((item: any) => item.animeId === animeId);
  });

  return {
    watchlist,
    loading,
    error,
    fetchWatchlist,
    addToWatchlist,
    updateStatus,
    updateProgress,
    removeFromWatchlist,
    isInWatchlist,
    getWatchlistItem,
  };
};
