import axios from "axios";

const TMDB_BASE_URL =
  process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || "";

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const tmdbService = {
  // Rechercher les films
  async searchMovies(query: string, page: number = 1) {
    try {
      const response = await tmdbClient.get("/search/movie", {
        params: {
          api_key: TMDB_API_KEY,
          query,
          page,
          language: "fr-FR",
        },
      });

      return response.data;
    } catch (error) {
      console.error("TMDB Search Error:", error);
      throw error;
    }
  },

  // Récupérer les détails d'un film
  async getMovieDetails(movieId: number) {
    try {
      const response = await tmdbClient.get(`/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: "fr-FR",
        },
      });

      return response.data;
    } catch (error) {
      console.error("TMDB Details Error:", error);
      throw error;
    }
  },

  // Films populaires
  async getPopularMovies(page: number = 1) {
    try {
      const response = await tmdbClient.get("/movie/popular", {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language: "fr-FR",
        },
      });

      return response.data;
    } catch (error) {
      console.error("TMDB Popular Error:", error);
      throw error;
    }
  },

  // Films à l'affiche
  async getNowPlayingMovies(page: number = 1) {
    try {
      const response = await tmdbClient.get("/movie/now_playing", {
        params: {
          api_key: TMDB_API_KEY,
          page,
          language: "fr-FR",
        },
      });

      return response.data;
    } catch (error) {
      console.error("TMDB Now Playing Error:", error);
      throw error;
    }
  },
};
