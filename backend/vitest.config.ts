import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      // Requis par config/env.ts au chargement du module - jamais utilisé en vrai
      JWT_SECRET: "test-secret-do-not-use-in-prod",
    },
  },
});
