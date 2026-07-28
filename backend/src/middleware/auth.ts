import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      user?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token requis" });
    }

    const decoded = jwt.verify(token, env.jwtSecret) as any;
    if (decoded.purpose === "2fa_pending") {
      return res.status(401).json({ error: "Authentification incomplète (2FA requise)" });
    }
    req.userId = decoded.id;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalide" });
  }
};
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as any;
      if (decoded.purpose !== "2fa_pending") {
        req.userId = decoded.id;
        req.user = decoded;
      }
    } catch {
    }
  }

  next();
};
