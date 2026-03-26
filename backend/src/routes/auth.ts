import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const router = Router();

// POST login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Identifiants requis" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Identifiants invalides" });

    const token = (jwt.sign as any)(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRY || "7d" },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: "Champs requis manquants" });

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: bcrypt.hashSync(password, 10),
      },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Email ou username déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
