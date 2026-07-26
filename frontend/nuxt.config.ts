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
      title: "AnimeTrack",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400&display=swap" },
      ],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "AnimeTrack — Suivez et découvrez des animes" },
      ],
    },
  },
});
