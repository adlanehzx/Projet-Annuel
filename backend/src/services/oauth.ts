import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

export interface OAuthProfile {
  providerId: string;
  email: string;
  username: string;
  avatar?: string;
}

const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

// Vérifie l'id_token émis par Google Identity Services directement auprès
// de Google (signature, audience, expiration) - le client ne peut pas
// forger un profil arbitraire.
export const verifyGoogleIdToken = async (
  idToken: string,
): Promise<OAuthProfile> => {
  if (!googleClient || !env.googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID non configuré côté serveur");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Token Google invalide");
  }
  if (!payload.email_verified) {
    throw new Error("Email Google non vérifié");
  }

  return {
    providerId: payload.sub,
    email: payload.email,
    username: payload.name || payload.email.split("@")[0],
    avatar: payload.picture,
  };
};

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

// Échange le code d'autorisation OAuth contre un access_token côté serveur
// (le client secret ne quitte jamais le backend), puis récupère le profil
// GitHub authentifié par ce token - impossible à forger depuis le client.
export const exchangeGithubCode = async (
  code: string,
): Promise<OAuthProfile> => {
  if (!env.githubClientId || !env.githubClientSecret) {
    throw new Error("GITHUB_CLIENT_ID/SECRET non configurés côté serveur");
  }

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: env.githubRedirectUri,
    },
    { headers: { Accept: "application/json" } },
  );

  const accessToken = tokenResponse.data?.access_token;
  if (!accessToken) {
    throw new Error("Échange du code GitHub échoué");
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  };

  const { data: profile } = await axios.get("https://api.github.com/user", {
    headers,
  });

  let email: string | undefined = profile.email;
  if (!email) {
    const { data: emails } = await axios.get<GithubEmail[]>(
      "https://api.github.com/user/emails",
      { headers },
    );
    email = emails.find((e) => e.primary && e.verified)?.email;
  }

  if (!email) {
    throw new Error("Aucun email vérifié disponible sur ce compte GitHub");
  }

  return {
    providerId: String(profile.id),
    email,
    username: profile.login,
    avatar: profile.avatar_url,
  };
};
