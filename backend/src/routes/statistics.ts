import { Router, Request, Response } from "express";
import {
  getBasicStatistics,
  getAdvancedStatistics,
  getRecommendations,
} from "../services/statistics.js";

const router = Router();

// GET /api/statistics/me - Récupérer les statistiques de base de l'utilisateur
router.get("/me", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const stats = await getBasicStatistics(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/statistics/advanced - Statistiques avancées
router.get("/advanced", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const stats = await getAdvancedStatistics(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/statistics/recommendations - Recommandations basées sur les goûts
router.get("/recommendations", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const recommendations = await getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
