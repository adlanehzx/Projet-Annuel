export default defineNuxtPlugin(() => {
  const SCRIPT_ID = "at-analytics-script";

  const config = useRuntimeConfig();
  const { canTrackAnalytics, init } = useCookieConsent();

  const provider = String(config.public.analyticsProvider || "").trim().toLowerCase();
  const scriptSrc = String(config.public.analyticsScriptSrc || "").trim();
  const websiteId = String(config.public.analyticsWebsiteId || "").trim();
  const analyticsDomain = String(
    config.public.analyticsDomain || window.location.hostname,
  ).trim();

  const removeAnalyticsScript = () => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) existing.remove();
  };

  const injectAnalyticsScript = () => {
    if (!scriptSrc) return;
    if (document.getElementById(SCRIPT_ID)) return;

    if (provider === "umami" && !websiteId) return;
    if (provider !== "umami" && provider !== "plausible") return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.src = scriptSrc;

    if (provider === "umami") {
      script.setAttribute("data-website-id", websiteId);
    }

    if (provider === "plausible") {
      script.setAttribute("data-domain", analyticsDomain);
    }

    document.head.appendChild(script);
  };

  init();

  if (canTrackAnalytics.value) {
    injectAnalyticsScript();
  }

  watch(canTrackAnalytics, (enabled) => {
    if (enabled) {
      injectAnalyticsScript();
      return;
    }

    removeAnalyticsScript();
  });
});
