import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

export const env = {
  jwtSecret: required("JWT_SECRET"),
  jwtExpiry: process.env.JWT_EXPIRY || "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI,
  nodeEnv: process.env.NODE_ENV || "development",
};
