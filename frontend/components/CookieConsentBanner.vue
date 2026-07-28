<template>
  <aside
    v-if="showBanner"
    role="dialog"
    aria-live="polite"
    aria-label="Banniere de consentement aux cookies"
    style="position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom, 0px));z-index:120;max-width:920px;margin:0 auto;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:16px 16px 14px;box-shadow:0 10px 30px rgba(0,0,0,0.2)"
    class="at-cookie-banner"
  >
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap">
      <div style="min-width:0;flex:1">
        <p style="margin:0 0 6px;font-family:var(--font-display);font-size:18px;line-height:1.2;color:var(--text-primary)">
          Votre vie privee, votre choix
        </p>
        <p style="margin:0;color:var(--text-secondary);font-size:14px;line-height:1.55">
          Nous utilisons uniquement des cookies techniques par defaut. La mesure d'audience (Umami/Plausible) est activee seulement si vous l'acceptez.
          <NuxtLink to="/privacy" style="color:var(--color-accent-primary);text-decoration:none">En savoir plus</NuxtLink>
        </p>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">
        <button
          type="button"
          @click="reject"
          style="padding:9px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-weight:500;cursor:pointer"
        >
          Refuser
        </button>
        <button
          type="button"
          @click="accept"
          style="padding:9px 14px;border-radius:8px;border:none;background:var(--color-accent-primary);color:#fff;font-weight:600;cursor:pointer"
        >
          Accepter
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { isDecided, init, setChoice } = useCookieConsent();

const showBanner = computed(() => !isDecided.value);

onMounted(() => {
  init();
});

const accept = () => setChoice("accepted");
const reject = () => setChoice("rejected");
</script>

<style scoped>
@media (max-width: 1023px) {
  .at-cookie-banner {
    bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important;
  }
}
</style>

