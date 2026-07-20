import { useApi } from "./useApi";

export const useAnimes = () => {
  const api = useApi();

  const searchAnimes = async (query: string) => {
    try {
      const response = await api.get(`/animes?q=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur recherche animes:", error);
      return [];
    }
  };

  const getAnimeDetails = async (animeId: number) => {
    try {
      const response = await api.get(`/animes/${animeId}`);
      return response.data;
    } catch (error: any) {
      console.error("Erreur détail anime:", error);
      throw error;
    }
  };

  const getTopAnimes = async () => {
    try {
      const response = await api.get("/animes/top");
      return response.data || [];
    } catch (error: any) {
      console.error("Erreur top animes:", error);
      return [];
    }
  };

  return {
    searchAnimes,
    getAnimeDetails,
    getTopAnimes,
  };
};