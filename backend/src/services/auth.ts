import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const generateTOTPSecret = async (email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Movie Tracker (${email})`,
    issuer: "Movie Tracker",
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

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};
