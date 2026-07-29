import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/env.js";

export const generateTOTPSecret = async (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Movie Tracker (${email})`,
    issuer: "HankoTrack",
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
  };
};

export const verifyTOTPToken = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2,
  });
};

export const generateJWT = (
  userId: number,
  email: string,
  expiresIn: jwt.SignOptions["expiresIn"] = env.jwtExpiry as jwt.SignOptions["expiresIn"],
): string => {
  return jwt.sign({ id: userId, email }, env.jwtSecret, {
    expiresIn,
  });
};

export const generateTwoFactorPendingToken = (userId: number): string => {
  return jwt.sign({ id: userId, purpose: "2fa_pending" }, env.jwtSecret, {
    expiresIn: "5m",
  });
};

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateBackupCode = (): string => {
  const bytes = crypto.randomBytes(8);
  let raw = "";
  for (let i = 0; i < 8; i++) {
    raw += BACKUP_CODE_ALPHABET[bytes[i] % BACKUP_CODE_ALPHABET.length];
  }
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
};

export const generateBackupCodes = (count = 8): string[] =>
  Array.from({ length: count }, generateBackupCode);

export const hashBackupCode = (code: string): string =>
  bcrypt.hashSync(code.trim().toUpperCase(), 10);

export const findBackupCodeIndex = (
  hashedCodes: string[],
  candidate: string,
): number => {
  const normalized = candidate.trim().toUpperCase();
  return hashedCodes.findIndex((hash) => bcrypt.compareSync(normalized, hash));
};
