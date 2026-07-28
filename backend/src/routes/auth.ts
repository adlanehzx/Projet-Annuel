import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import {
  generateTOTPSecret,
  verifyTOTPToken,
  generateJWT,
  generateTwoFactorPendingToken,
  hashPassword,
  comparePassword,
  generateBackupCodes,
  hashBackupCode,
  findBackupCodeIndex,
} from "../services/auth.js";
import { verifyGoogleIdToken, exchangeGithubCode } from "../services/oauth.js";
import { authMiddleware } from "../middleware/auth.js";
import { env } from "../config/env.js";
import type { OAuthProfile } from "../services/oauth.js";
import { emitToAll } from "../realtime/socket.js";

const prisma = new PrismaClient();
const router = Router();
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

    emitToAll("stats:global-changed", { reason: "user-created" });

    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Email ou username déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, totpToken, backupCode } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Identifiants requis" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !comparePassword(password, user.password))
      return res.status(401).json({ error: "Identifiants invalides" });

    if (user.totpEnabled) {
      if (backupCode) {
        const idx = findBackupCodeIndex(user.totpBackupCodes, backupCode);
        if (idx === -1)
          return res.status(401).json({ error: "Code de secours invalide" });

        const remaining = [...user.totpBackupCodes];
        remaining.splice(idx, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: { totpBackupCodes: remaining },
        });
      } else if (!totpToken) {
        return res
          .status(401)
          .json({ error: "2FA requis", requiresTwoFactor: true });
      } else if (!user.totpSecret || !verifyTOTPToken(user.totpSecret, totpToken)) {
        return res.status(401).json({ error: "Token 2FA invalide" });
      }
    }

    const token = generateJWT(user.id, user.email);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
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
router.post(
  "/2fa/enable",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { secret, totpToken } = req.body;

      if (!secret || !totpToken)
        return res.status(400).json({ error: "Données manquantes" });
      if (!verifyTOTPToken(secret, totpToken))
        return res.status(400).json({ error: "Token invalide" });

      const backupCodes = generateBackupCodes();

      await prisma.user.update({
        where: { id: userId },
        data: {
          totpSecret: secret,
          totpEnabled: true,
          totpBackupCodes: backupCodes.map(hashBackupCode),
        },
      });

      res.json({
        message: "2FA activé avec succès",
        backupCodes,
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);
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
          totpBackupCodes: [],
        },
      });

      res.json({ message: "2FA désactivé" });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);
router.get(
  "/2fa/status",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { totpEnabled: true, totpBackupCodes: true },
      });

      res.json({
        totpEnabled: user?.totpEnabled ?? false,
        backupCodesRemaining: user?.totpBackupCodes?.length ?? 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

router.post(
  "/2fa/backup-codes/regenerate",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const { password } = req.body;

      if (!password)
        return res.status(400).json({ error: "Données manquantes" });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.totpEnabled)
        return res.status(400).json({ error: "2FA non activée" });

      if (
        !user.password ||
        !comparePassword(password, user.password)
      )
        return res.status(401).json({ error: "Mot de passe invalide" });

      const backupCodes = generateBackupCodes();
      await prisma.user.update({
        where: { id: userId },
        data: { totpBackupCodes: backupCodes.map(hashBackupCode) },
      });

      res.json({ backupCodes });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
);

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
router.post("/oauth/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ error: "idToken Google manquant" });

    const profile = await verifyGoogleIdToken(idToken);
    const user = await findOrCreateOAuthUser("google", profile);

    if (user.totpEnabled) {
      return res.json({
        requiresTwoFactor: true,
        pendingToken: generateTwoFactorPendingToken(user.id),
      });
    }

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Username déjà utilisé" });
    res
      .status(401)
      .json({ error: error.message || "Authentification Google invalide" });
  }
});
router.post("/oauth/github", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code)
      return res.status(400).json({ error: "code GitHub manquant" });

    const profile = await exchangeGithubCode(code);
    const user = await findOrCreateOAuthUser("github", profile);

    if (user.totpEnabled) {
      return res.json({
        requiresTwoFactor: true,
        pendingToken: generateTwoFactorPendingToken(user.id),
      });
    }

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Username déjà utilisé" });
    res
      .status(401)
      .json({ error: error.message || "Authentification GitHub invalide" });
  }
});

// Complète une connexion OAuth (Google/GitHub) sur un compte avec 2FA
// activée : échange le pendingToken + le code TOTP/de secours contre un
// vrai token de session.
router.post("/oauth/2fa", async (req: Request, res: Response) => {
  try {
    const { pendingToken, totpToken, backupCode } = req.body;
    if (!pendingToken)
      return res.status(400).json({ error: "Session 2FA manquante" });

    let payload: any;
    try {
      payload = jwt.verify(pendingToken, env.jwtSecret);
    } catch {
      return res
        .status(401)
        .json({ error: "Session 2FA expirée, reconnectez-vous" });
    }
    if (payload.purpose !== "2fa_pending") {
      return res.status(401).json({ error: "Session 2FA invalide" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.totpEnabled) {
      return res.status(401).json({ error: "2FA non activée" });
    }

    if (backupCode) {
      const idx = findBackupCodeIndex(user.totpBackupCodes, backupCode);
      if (idx === -1)
        return res.status(401).json({ error: "Code de secours invalide" });

      const remaining = [...user.totpBackupCodes];
      remaining.splice(idx, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: { totpBackupCodes: remaining },
      });
    } else if (!totpToken) {
      return res
        .status(401)
        .json({ error: "2FA requis", requiresTwoFactor: true });
    } else if (!user.totpSecret || !verifyTOTPToken(user.totpSecret, totpToken)) {
      return res.status(401).json({ error: "Code 2FA invalide" });
    }

    const token = generateJWT(user.id, user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

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
        password: true,
      },
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { password, ...safeUser } = user;
    res.json({
      ...safeUser,
      hasPassword: !!password,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
router.put("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { username, bio, isPublic } = req.body;

    let nextBio: string | null | undefined = undefined;
    if (bio !== undefined) {
      if (bio === null) {
        nextBio = null;
      } else if (typeof bio !== "string") {
        return res.status(400).json({ error: "La bio doit être une chaîne de caractères" });
      } else {
        const trimmed = bio.trim();
        if (trimmed.length > 500) {
          return res.status(400).json({ error: "La bio ne peut pas dépasser 500 caractères" });
        }
        nextBio = trimmed.length > 0 ? trimmed : null;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(nextBio !== undefined && { bio: nextBio }),
        ...(isPublic !== undefined && { isPublic }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
        isPublic: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(400).json({ error: "Username déjà utilisé" });
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/account", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { password, confirmation } = req.body || {};

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (typeof confirmation !== "string" || confirmation.trim() !== user.username) {
      return res.status(400).json({
        error: "Confirmez la suppression en saisissant votre nom d'utilisateur",
      });
    }

    if (user.password) {
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Mot de passe requis" });
      }
      if (!comparePassword(password, user.password)) {
        return res.status(401).json({ error: "Mot de passe invalide" });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    emitToAll("stats:global-changed", { reason: "user-deleted" });

    res.json({ success: true, message: "Compte supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
