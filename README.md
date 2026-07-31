# HankoTrack

Application de suivi d'animés (watchlist, notes, critiques, listes, statistiques) — projet annuel ESGI, spécialisation Ingénierie du Web.

## Stack

- Frontend : Nuxt 3 + TailwindCSS
- Backend : Node.js / Express + Prisma
- Base de données : PostgreSQL
- Authentification : email/mot de passe, OAuth Google/GitHub, 2FA (TOTP)
- Déploiement : Docker Compose + Caddy (VPS), CI/CD GitHub Actions
- Analytique : Umami

## Lancer en local

```bash
docker compose up -d --build
```

Frontend sur `http://localhost:3000`, backend sur `http://localhost:3001`.

## Liens

- Dépôt : https://github.com/adlanehzx/Projet-Annuel
- Board Trello : https://trello.com/b/ls0WMGMn/pa
