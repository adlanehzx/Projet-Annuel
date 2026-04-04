import { ref } from "vue";
import { useApi } from "./useApi";

export const useReviews = () => {
  const api = useApi();
  const loading = ref(false);
  const error = ref("");

  const getReview = async (watchlistId: number) => {
    try {
      const response = await api.get(`/reviews/${watchlistId}`);
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors du chargement";
      return null;
    }
  };

  const getMovieReviews = async (watchlistId: number) => {
    try {
      const response = await api.get(`/reviews/movie/${watchlistId}`);
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors du chargement";
      return [];
    }
  };

  const createOrUpdateReview = async (
    watchlistId: number,
    rating: number,
    comment: string,
  ) => {
    try {
      loading.value = true;
      const response = await api.post("/reviews", {
        watchlistId,
        rating,
        comment,
      });
      return response.data;
    } catch (e: any) {
      error.value =
        e.response?.data?.error || "Erreur lors de l'enregistrement";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteReview = async (id: number) => {
    try {
      await api.del(`/reviews/${id}`);
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la suppression";
      throw e;
    }
  };

  return {
    loading,
    error,
    getReview,
    getMovieReviews,
    createOrUpdateReview,
    deleteReview,
  };
};
