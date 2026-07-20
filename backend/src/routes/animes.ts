import { Router, Request, Response } from "express";
import { getCommunityTopAnimes } from "../services/recommendations.js";

const router = Router();

router.get("/top", async (_req: Request, res: Response) => {
  try {
    const topAnimes = await getCommunityTopAnimes();

    res.json(topAnimes);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;