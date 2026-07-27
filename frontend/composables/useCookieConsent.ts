type CookieConsentChoice = "accepted" | "rejected";

const CONSENT_KEY = "at-cookie-consent";

export const useCookieConsent = () => {
  const choice = useState<CookieConsentChoice | null>("cookie-consent-choice", () => null);
  const initialized = useState<boolean>("cookie-consent-initialized", () => false);

  const init = () => {
    if (!process.client || initialized.value) return;

    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") {
      choice.value = saved;
    }

    initialized.value = true;
  };

  const setChoice = (next: CookieConsentChoice) => {
    choice.value = next;
    if (process.client) {
      localStorage.setItem(CONSENT_KEY, next);
      localStorage.setItem("at-cookie-consent-updated-at", new Date().toISOString());
    }
  };

  const resetChoice = () => {
    choice.value = null;
    if (process.client) {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem("at-cookie-consent-updated-at");
    }
  };

  const isDecided = computed(() => choice.value !== null);
  const canTrackAnalytics = computed(() => choice.value === "accepted");

  return {
    choice,
    isDecided,
    canTrackAnalytics,
    init,
    setChoice,
    resetChoice,
  };
};
