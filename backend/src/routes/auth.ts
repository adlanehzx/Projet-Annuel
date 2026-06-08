import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  generateTOTPSecret,
  verifyTOTPToken,
  generateJWT,
  hashPassword,
  comparePassword,
} from "../services/auth.js";

const prisma = new PrismaClient();
const router = Router();

// ====== Authentication Standard ======

// POST /api/auth/register - Inscription
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: "Champs requis manquants" });

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashPassword(password),
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

// POST /api/auth/login - Connexion
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, totpToken } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Identifiants requis" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !comparePassword(password, user.password))
      return res.status(401).json({ error: "Identifiants invalides" });

    // Si 2FA activé, vérifier le token TOTP
    if (user.totpEnabled) {
      if (!totpToken)
        return res
          .status(401)
          .json({ error: "2FA requis", requiresTwoFactor: true });

      if (!user.totpSecret || !verifyTOTPToken(user.totpSecret, totpToken))
        return res.status(401).json({ error: "Token 2FA invalide" });
    }

    const token = generateJWT(user.id, user.email);

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ====== Two-Factor Authentication (2FA) ======

// POST /api/auth/2fa/setup - Générer QR code pour 2FA
router.post("/2fa/setup", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { secret, qrCode } = await generateTOTPSecret(user.email);

    res.json({
      secret,
      qrCode,
      message: "Scannez le QR code avec votre appli d'authentification",
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/auth/2fa/enable - Activer 2FA avec vérification
router.post("/2fa/enable", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { secret, totpToken } = req.body;

    if (!userId || !secret || !totpToken)
      return res.status(400).json({ error: "Données manquantes" });

    // Vérifier que le token est correct
    if (!verifyTOTPToken(secret, totpToken))
      return res.status(400).json({ error: "Token invalide" });

    // Activer 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: secret,
        totpEnabled: true,
      },
    });

    res.json({ message: "2FA activé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/auth/2fa/disable - Désactiver 2FA
router.post("/2fa/disable", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;

    if (!userId || !password)
      return res.status(400).json({ error: "Données manquantes" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password || !comparePassword(password, user.password))
      return res.status(401).json({ error: "Mot de passe invalide" });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: null,
        totpEnabled: false,
      },
    });

    res.json({ message: "2FA désactivé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/auth/2fa/status - Vérifier le statut 2FA
router.get("/2fa/status", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpEnabled: true },
    });

    res.json({ totpEnabled: user?.totpEnabled ?? false });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ====== OAuth2 ======

// POST /api/auth/oauth/google - Callback OAuth Google
router.post("/oauth/google", async (req: Request, res: Response) => {
  try {
    const { googleId, email, username, picture } = req.body;

    if (!googleId || !email)
      return res.status(400).json({ error: "Données Google manquantes" });

    // Chercher l'utilisateur
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Créer si n'existe pas
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username: username || email.split("@")[0],
          googleId,
          avatar: picture,
        },
      });
    } else {
      // Lier le compte Google si pas déjà lié
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: picture || user.avatar },
        });
      }
    }

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur OAuth Google" });
  }
});

// POST /api/auth/oauth/github - Callback OAuth Github
router.post("/oauth/github", async (req: Request, res: Response) => {
  try {
    const { githubId, email, username, avatar } = req.body;

    if (!githubId || !email)
      return res.status(400).json({ error: "Données GitHub manquantes" });

    // Chercher l'utilisateur
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Créer si n'existe pas
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username: username || email.split("@")[0],
          githubId,
          avatar,
        },
      });
    } else {
      // Lier le compte GitHub si pas déjà lié
      if (!user.githubId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId, avatar: avatar || user.avatar },
        });
      }
    }

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur OAuth GitHub" });
  }
});

// GET /api/auth/profile - Récupérer le profil de l'utilisateur
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        isPublic: true,
        totpEnabled: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/auth/profile - Mettre à jour le profil
router.put("/profile", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { username, bio, avatar, isPublic } = req.body;

    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(isPublic !== undefined && { isPublic }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        isPublic: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Username déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
