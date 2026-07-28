# Tests end-to-end

Les tests E2E utilisent Playwright et démarrent automatiquement le frontend Nuxt
sur `http://127.0.0.1:3000`.

## Installation initiale

```bash
npm install
npm --prefix frontend install --legacy-peer-deps
npx playwright install chromium
```

## Exécution

```bash
npm run e2e
```

Commandes utiles :

```bash
npm run e2e:ui
npm run e2e:report
```

Pour cibler une instance déjà démarrée (par exemple via Docker Compose), indiquez
son URL. Dans ce mode, Playwright ne lance pas de serveur local :

```bash
E2E_BASE_URL=http://localhost:3000 npm run e2e
```

Les scénarios actuels couvrent la navigation publique et les validations
front-end du formulaire d'inscription. Les tests qui créent des données doivent
utiliser une base de données dédiée aux tests pour rester isolés.
