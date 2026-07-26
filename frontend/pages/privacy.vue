<template>
  <div style="background:var(--bg);color:var(--text-primary);min-height:100vh;padding:34px 24px 72px">
    <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:24px">
      <div style="padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)">
        <p style="font-family:var(--font-mono);font-size:12px;letter-spacing:2px;color:var(--color-accent-primary);margin:0 0 10px">
          CONFIDENTIALITE
        </p>
        <h1 style="font-family:var(--font-display);font-size:34px;line-height:1.1;margin:0 0 14px">
          Politique de confidentialite
        </h1>
        <p style="font-size:15px;line-height:1.65;color:var(--text-secondary);margin:0 0 8px">
          Cette page presente la politique de confidentialite d'AnimeTrack dans le cadre de son exploitation en production. Elle precise quelles donnees sont traitees, dans quels buts et comment exercer vos droits.
        </p>
        <p style="font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary);margin:0">
          Derniere mise a jour: 26/07/2026
        </p>
      </div>

      <section style="padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)">
        <h2 style="font-family:var(--font-display);font-size:24px;margin:0 0 12px">1. Donnees collectees</h2>
        <ul style="margin:0;padding-left:18px;display:grid;gap:8px;color:var(--text-secondary);line-height:1.6">
          <li>Donnees de compte: identifiant, email, methode de connexion.</li>
          <li>Donnees d'utilisation: watchlist, listes, notes et critiques publiees.</li>
          <li>Donnees techniques minimales: journaux de requetes, informations de securite et identifiants techniques necessaires au fonctionnement du service.</li>
        </ul>
      </section>

      <section style="padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)">
        <h2 style="font-family:var(--font-display);font-size:24px;margin:0 0 12px">2. Finalites</h2>
        <ul style="margin:0;padding-left:18px;display:grid;gap:8px;color:var(--text-secondary);line-height:1.6">
          <li>Fournir les fonctionnalites principales de suivi et d'organisation des animes.</li>
          <li>Securiser les comptes et prevenir les usages abusifs.</li>
          <li>Mesurer l'audience et la performance du service uniquement lorsque vous l'avez autorise.</li>
        </ul>
      </section>

      <section style="padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)">
        <h2 style="font-family:var(--font-display);font-size:24px;margin:0 0 12px">3. Cookies et consentement</h2>
        <p style="margin:0 0 10px;color:var(--text-secondary);line-height:1.6">
          Les cookies strictement necessaires au fonctionnement (authentification, securite de session) restent actifs.
        </p>
        <p style="margin:0 0 10px;color:var(--text-secondary);line-height:1.6">
          Les cookies ou traceurs de mesure d'audience ne sont actifs qu'apres votre accord explicite.
        </p>
        <p style="margin:0;color:var(--text-secondary);line-height:1.6">
          Vous pouvez modifier votre choix a tout moment depuis la banniere de consentement.
        </p>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">
          <p style="margin:0;font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary)">
            Etat actuel: {{ consentStatusLabel }}
          </p>
          <button
            type="button"
            @click="reopenConsent"
            style="padding:8px 13px;border-radius:8px;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-weight:500;cursor:pointer"
          >
            Modifier mon choix cookies
          </button>
        </div>
      </section>

      <section style="padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)">
        <h2 style="font-family:var(--font-display);font-size:24px;margin:0 0 12px">4. Duree de conservation</h2>
        <ul style="margin:0;padding-left:18px;display:grid;gap:8px;color:var(--text-secondary);line-height:1.6">
          <li>Donnees de compte conservees tant que le compte est actif.</li>
          <li>Contenus personnels (listes, notes, critiques) supprimes avec le compte ou sur demande, sous reserve des obligations legales applicables.</li>
          <li>Journaux techniques conserves pour une duree limitee de securite.</li>
        </ul>
      </section>

      <section style="padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--bg-elevated)">
        <h2 style="font-family:var(--font-display);font-size:24px;margin:0 0 12px">5. Vos droits</h2>
        <p style="margin:0 0 10px;color:var(--text-secondary);line-height:1.6">
          Conformement au RGPD, vous pouvez demander l'acces, la rectification, l'effacement ou la portabilite de vos donnees.
        </p>
        <p style="margin:0;color:var(--text-secondary);line-height:1.6">
          Pour exercer ces droits, contactez l'equipe AnimeTrack via le moyen de contact indique dans l'application ou dans la documentation du service.
        </p>
      </section>

      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:2px">
        <NuxtLink
          to="/"
          style="padding:10px 16px;border-radius:8px;text-decoration:none;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-weight:500"
        >
          Retour a l'accueil
        </NuxtLink>
        <NuxtLink
          to="/auth/register"
          style="padding:10px 16px;border-radius:8px;text-decoration:none;border:none;background:var(--color-accent-primary);color:#fff;font-weight:500"
        >
          Creer un compte
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCookieConsent } from "../composables/useCookieConsent";

const { choice, init, resetChoice } = useCookieConsent();

const consentStatusLabel = computed(() => {
  if (choice.value === "accepted") return "mesure d'audience acceptee";
  if (choice.value === "rejected") return "mesure d'audience refusee";
  return "aucun choix enregistre";
});

const reopenConsent = () => {
  resetChoice();
};

onMounted(() => {
  init();
});
</script>

