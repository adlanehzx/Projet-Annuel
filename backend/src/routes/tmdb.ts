import { Router, Request, Response } from "express";
import { tmdbService } from "../services/tmdb.js";

const router = Router();

// Rechercher les films
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q, page } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Paramètre 'q' requis" });
    }

    const results = await tmdbService.searchMovies(
      q as string,
      parseInt(page as string) || 1,
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la recherche" });
  }
});

// Films populaires
router.get("/popular", async (req: Request, res: Response) => {
  try {
    const { page } = req.query;
    const results = await tmdbService.getPopularMovies(
      parseInt(page as string) || 1,
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// Films à l'affiche
router.get("/now-playing", async (req: Request, res: Response) => {
  try {
    const { page } = req.query;
    const results = await tmdbService.getNowPlayingMovies(
      parseInt(page as string) || 1,
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// Détails d'un film
router.get("/movie/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await tmdbService.getMovieDetails(parseInt(id));
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: "Film non trouvé" });
  }
});

export default router;
