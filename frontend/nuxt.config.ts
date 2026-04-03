export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || "http://backend:3001/api",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001/api",
    },
  },

  ssr: true,

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [],
      failOnError: false,
    },
  },

  app: {
    head: {
      title: "CineTrack - Suivi Cinématographique",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Application de suivi cinématographique - Style Letterboxd",
        },
      ],
    },
  },
});
