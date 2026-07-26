import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  generateTOTPSecret,
  verifyTOTPToken,
  generateJWT,
  hashPassword,
  comparePassword,
} from "../services/auth.js";
import { verifyGoogleIdToken, exchangeGithubCode } from "../services/oauth.js";
import { authMiddleware } from "../middleware/auth.js";
import type { OAuthProfile } from "../services/oauth.js";

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
// Toutes ces routes nécessitent un utilisateur authentifié (authMiddleware).

// POST /api/auth/2fa/setup - Générer QR code pour 2FA
router.post(
  "/2fa/setup",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user)
        return res.status(404).json({ error: "Utilisateur non trouvé" });

      const { secret, qrCode } = await generateTOTPSecret(user.email);

      res.json({
        secret,
        qrCode,
        message: "Scannez le QR code avec votre appli d'authentification",
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

// POST /api/auth/2fa/enable - Activer 2FA avec vérification
router.post(
  "/2fa/enable",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { secret, totpToken } = req.body;

      if (!secret || !totpToken)
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
  },
);

// POST /api/auth/2fa/disable - Désactiver 2FA
router.post(
  "/2fa/disable",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { password } = req.body;

      if (!password)
        return res.status(400).json({ error: "Données manquantes" });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (
        !user ||
        !user.password ||
        !comparePassword(password, user.password)
      )
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
  },
);

// GET /api/auth/2fa/status - Vérifier le statut 2FA
router.get(
  "/2fa/status",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totpEnabled: true },
      });

      res.json({ totpEnabled: user?.totpEnabled ?? false });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

// ====== OAuth2 ======

const findOrCreateOAuthUser = async (
  provider: "google" | "github",
  profile: OAuthProfile,
) => {
  const providerColumn = provider === "google" ? "googleId" : "githubId";

  let user = await prisma.user.findUnique({ where: { email: profile.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        username: profile.username,
        avatar: profile.avatar,
        [providerColumn]: profile.providerId,
      },
    });
  } else if (!(user as any)[providerColumn]) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        [providerColumn]: profile.providerId,
        avatar: profile.avatar || user.avatar,
      },
    });
  }

  return user;
};

// POST /api/auth/oauth/google - Connexion via Google
// Le frontend envoie l'id_token émis par Google Identity Services ; il est
// vérifié auprès de Google avant toute création/liaison de compte.
router.post("/oauth/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ error: "idToken Google manquant" });

    const profile = await verifyGoogleIdToken(idToken);
    const user = await findOrCreateOAuthUser("google", profile);

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Username déjà utilisé" });
    res
      .status(401)
      .json({ error: error.message || "Authentification Google invalide" });
  }
});

// POST /api/auth/oauth/github - Connexion via GitHub
// Le frontend envoie le code d'autorisation reçu de GitHub ; il est échangé
// contre un access_token côté serveur (le client secret ne quitte jamais
// le backend) avant toute création/liaison de compte.
router.post("/oauth/github", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({ error: "code GitHub manquant" });

    const profile = await exchangeGithubCode(code);
    const user = await findOrCreateOAuthUser("github", profile);

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Username déjà utilisé" });
    res
      .status(401)
      .json({ error: error.message || "Authentification GitHub invalide" });
  }
});

// GET /api/auth/profile - Récupérer le profil de l'utilisateur
router.get("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

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
router.put("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { username, bio, avatar, isPublic } = req.body;

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
