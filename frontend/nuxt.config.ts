export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || "http://backend:3001/api",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3001/api",
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      githubClientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID || "",
      githubRedirectUri:
        process.env.NUXT_PUBLIC_GITHUB_REDIRECT_URI ||
        "http://localhost:3000/auth/callback/github",
      analyticsProvider: process.env.NUXT_PUBLIC_ANALYTICS_PROVIDER || "",
      analyticsScriptSrc: process.env.NUXT_PUBLIC_ANALYTICS_SCRIPT_SRC || "",
      analyticsWebsiteId: process.env.NUXT_PUBLIC_ANALYTICS_WEBSITE_ID || "",
      analyticsDomain: process.env.NUXT_PUBLIC_ANALYTICS_DOMAIN || "",
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

  alias: {
    "form-data": "form-data/lib/form_data.js",
  },

  app: {
    head: {
      title: "HankoTrack",
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/images/hankotrack-maneki-neko-round.svg" },
        { rel: "icon", type: "image/png", href: "/images/hankotrack-maneki-neko-round.png" },
        { rel: "apple-touch-icon", href: "/images/hankotrack-maneki-neko-round.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400&display=swap",
        },
      ],
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "HankoTrack — Suivez et découvrez des animés" },
      ],
    },
  },
});
