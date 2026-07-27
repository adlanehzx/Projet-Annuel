import { Router, Request, Response } from "express";
import { getPersonalRecommendations } from "../services/recommendations.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const recommendations = await getPersonalRecommendations(userId);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;