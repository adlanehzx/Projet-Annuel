import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        watchlist: true,
        reviews: true,
      },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
