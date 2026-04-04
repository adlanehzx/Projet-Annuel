import { useApi } from "./useApi";

export const useTmdb = () => {
  const api = useApi();

  const getMovieDetails = async (tmdbId: number) => {
    try {
      const response = await api.get(`/tmdb/movie/${tmdbId}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur TMDB:", error);
      throw error;
    }
  };

  const searchMovies = async (query: string) => {
    try {
      const response = await api.get(
        `/tmdb/search?q=${encodeURIComponent(query)}`,
      );
      return response.data.results || [];
    } catch (error: any) {
      console.error("Erreur TMDB search:", error);
      return [];
    }
  };

  const getPopularMovies = async () => {
    try {
      const response = await api.get("/tmdb/popular");
      return response.data.results || [];
    } catch (error: any) {
      console.error("Erreur TMDB popular:", error);
      return [];
    }
  };

  const getNowPlayingMovies = async () => {
    try {
      const response = await api.get("/tmdb/now-playing");
      return response.data.results || [];
    } catch (error: any) {
      console.error("Erreur TMDB now-playing:", error);
      return [];
    }
  };

  return {
    getMovieDetails,
    searchMovies,
    getPopularMovies,
    getNowPlayingMovies,
  };
};
