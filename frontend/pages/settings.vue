<template>
  <div style="max-width:640px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:24px;letter-spacing:-0.01em;margin:0 0 20px;color:var(--text-primary)">Paramètres</h1>

    <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px">
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 4px;color:var(--text-primary)">Description du profil</h2>
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 16px">
        Cette description est visible par les autres utilisateurs qui visitent ton profil public.
      </p>

      <div
        v-if="bioFeedback"
        style="margin-bottom:16px;padding:10px 14px;border-radius:8px;font-size:13px;background:rgba(46,160,67,0.1);border:1px solid rgba(46,160,67,0.3);color:#2ea043"
      >
        {{ bioFeedback }}
      </div>
      <p v-if="bioError" style="margin:0 0 12px;font-size:13px;color:var(--color-accent-primary)">{{ bioError }}</p>

      <textarea
        v-model="bioDraft"
        maxlength="500"
        rows="4"
        placeholder="Parlez un peu de vous, de vos goûts animés…"
        class="at-input"
        style="resize:vertical;min-height:96px;line-height:1.55;margin-bottom:10px"
        :disabled="loadingBio || bioSaving"
      ></textarea>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary)">{{ bioDraft.length }}/500</span>
        <button
          type="button"
          class="at-btn-primary"
          :disabled="loadingBio || bioSaving"
          @click="handleSaveBio"
        >
          {{ bioSaving ? "Enregistrement…" : "Enregistrer la description" }}
        </button>
      </div>
    </div>

    <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px">
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 4px;color:var(--text-primary)">Confidentialité</h2>
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 16px">
        Un profil public permet aux autres utilisateurs de voir tes statistiques, tes listes publiques et tes reviews via ton profil.
      </p>

      <div
        v-if="privacyFeedback"
        style="margin-bottom:16px;padding:10px 14px;border-radius:8px;font-size:13px;background:rgba(46,160,67,0.1);border:1px solid rgba(46,160,67,0.3);color:#2ea043"
      >
        {{ privacyFeedback }}
      </div>

      <p v-if="loadingPrivacy" style="font-size:13px;color:var(--text-secondary)">Chargement...</p>
      <label v-else style="display:flex;align-items:center;gap:10px;cursor:pointer;width:fit-content">
        <input
          type="checkbox"
          :checked="isProfilePublic"
          :disabled="privacyLoading"
          @change="handleTogglePrivacy"
        />
        <span style="font-size:14px;color:var(--text-primary)">
          Rendre mon profil public
          (<strong :style="isProfilePublic ? 'color:#2ea043' : 'color:var(--color-accent-primary)'">{{ isProfilePublic ? "activé" : "désactivé" }}</strong>)
        </span>
      </label>
    </div>

    <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px">
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 4px;color:var(--text-primary)">Authentification à deux facteurs</h2>
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 20px">
        Ajoutez une couche de sécurité supplémentaire à votre compte.
      </p>

      <div
        v-if="feedback"
        style="margin-bottom:16px;padding:10px 14px;border-radius:8px;font-size:13px"
        :style="feedbackIsError
          ? 'background:rgba(192,25,43,0.1);border:1px solid rgba(192,25,43,0.3);color:var(--color-accent-primary)'
          : 'background:rgba(46,160,67,0.1);border:1px solid rgba(46,160,67,0.3);color:#2ea043'"
      >
        {{ feedback }}
      </div>

      <p v-if="loadingStatus" style="font-size:13px;color:var(--text-secondary)">Chargement...</p>

      <div
        v-if="backupCodesToShow"
        style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;padding:16px;border:1px solid var(--color-accent-primary);border-radius:10px"
      >
        <p style="font-size:13px;color:var(--text-primary);margin:0">
          <strong>Sauvegardez ces codes de secours maintenant</strong> — ils ne seront plus jamais réaffichés. Chacun ne peut être utilisé qu'une seule fois pour vous connecter si vous perdez l'accès à votre application d'authentification.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-family:var(--font-mono);font-size:14px;color:var(--text-primary)">
          <span v-for="code in backupCodesToShow" :key="code">{{ code }}</span>
        </div>
        <button class="at-btn-primary" style="max-width:160px" @click="backupCodesToShow = null">
          J'ai sauvegardé mes codes
        </button>
      </div>

      <template v-else>
        <div v-if="twoFactorEnabled && !setupState" style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:14px;color:var(--text-secondary)">
            La 2FA est actuellement <strong style="color:#2ea043">activée</strong>.
            ({{ backupCodesRemaining }} code{{ backupCodesRemaining === 1 ? "" : "s" }} de secours restant{{ backupCodesRemaining === 1 ? "" : "s" }})
          </p>

          <div style="display:flex;flex-direction:column;gap:8px">
            <input
              v-model="regeneratePassword"
              type="password"
              placeholder="Mot de passe pour régénérer les codes"
              class="at-input"
              style="max-width:280px"
            />
            <button
              class="at-btn-secondary"
              style="max-width:260px"
              :disabled="!regeneratePassword || actionLoading"
              @click="handleRegenerate"
            >
              Régénérer les codes de secours
            </button>
          </div>

          <input
            v-model="disablePassword"
            type="password"
            placeholder="Mot de passe pour désactiver"
            class="at-input"
            style="max-width:280px"
          />
          <button
            class="at-btn-secondary"
            style="max-width:220px"
            :disabled="!disablePassword || actionLoading"
            @click="handleDisable"
          >
            Désactiver la 2FA
          </button>
        </div>

        <div v-else-if="!twoFactorEnabled && !setupState" style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:14px;color:var(--text-secondary)">
            La 2FA est actuellement <strong style="color:var(--color-accent-primary)">désactivée</strong>.
          </p>
          <button
            class="at-btn-primary"
            style="max-width:220px"
            :disabled="actionLoading"
            @click="handleStartSetup"
          >
            Activer la 2FA
          </button>
        </div>

        <div v-else-if="setupState" style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:14px;color:var(--text-secondary)">
            Scannez ce QR code avec votre application d'authentification
            (Google Authenticator, Authy...), puis entrez le code généré.
          </p>
          <img
            :src="setupState.qrCode"
            alt="QR code 2FA"
            style="width:180px;height:180px;background:#fff;padding:8px;border-radius:8px"
          />
          <input
            v-model="enableToken"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="Code à 6 chiffres"
            class="at-input"
            style="max-width:220px"
          />
          <div style="display:flex;gap:12px">
            <button
              class="at-btn-primary"
              style="max-width:160px"
              :disabled="!enableToken || actionLoading"
              @click="handleConfirmEnable"
            >
              Confirmer
            </button>
            <button class="at-btn-secondary" style="max-width:120px" @click="setupState = null">
              Annuler
            </button>
          </div>
        </div>
      </template>
    </div>

    <div style="background:var(--bg-elevated);border:1px solid rgba(192,25,43,0.35);border-radius:14px;padding:24px">
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 4px;color:var(--color-accent-primary)">
        Supprimer mon compte
      </h2>
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 16px;line-height:1.55">
        Cette action est définitive. Vos listes, reviews, watchlist et données associées seront effacées.
      </p>

      <div
        v-if="deleteError"
        style="margin-bottom:14px;padding:10px 14px;border-radius:8px;font-size:13px;background:rgba(192,25,43,0.1);border:1px solid rgba(192,25,43,0.3);color:var(--color-accent-primary)"
      >
        {{ deleteError }}
      </div>

      <label style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;font-size:13px;font-weight:500;color:var(--text-primary)">
        Tapez votre nom d'utilisateur pour confirmer
        <input
          v-model="deleteConfirmation"
          type="text"
          :placeholder="user?.username || 'username'"
          class="at-input"
          autocomplete="off"
        />
      </label>

      <label
        v-if="hasPassword"
        style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;font-size:13px;font-weight:500;color:var(--text-primary)"
      >
        Mot de passe
        <input
          v-model="deletePassword"
          type="password"
          placeholder="Votre mot de passe"
          class="at-input"
          autocomplete="current-password"
        />
      </label>

      <button
        type="button"
        :disabled="deleteLoading || !canDeleteAccount"
        @click="handleDeleteAccount"
        :style="`padding:11px 18px;border:none;border-radius:8px;background:var(--color-accent-primary);color:#fff;font-family:var(--font-body);font-weight:600;font-size:14px;cursor:${(!canDeleteAccount || deleteLoading) ? 'not-allowed' : 'pointer'};opacity:${(!canDeleteAccount || deleteLoading) ? 0.55 : 1}`"
      >
        {{ deleteLoading ? "Suppression…" : "Supprimer définitivement mon compte" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const {
  user,
  get2FAStatus,
  setup2FA,
  enable2FA,
  disable2FA,
  regenerateBackupCodes,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} = useAuth();

const loadingPrivacy = ref(true);
const privacyLoading = ref(false);
const isProfilePublic = ref(false);
const privacyFeedback = ref("");

const loadingBio = ref(true);
const bioSaving = ref(false);
const bioDraft = ref("");
const bioFeedback = ref("");
const bioError = ref("");
const hasPassword = ref(true);

const deleteConfirmation = ref("");
const deletePassword = ref("");
const deleteLoading = ref(false);
const deleteError = ref("");

const canDeleteAccount = computed(() => {
  const username = user.value?.username || "";
  if (!username || deleteConfirmation.value.trim() !== username) return false;
  if (hasPassword.value && !deletePassword.value) return false;
  return true;
});

const refreshPrivacy = async () => {
  loadingPrivacy.value = true;
  loadingBio.value = true;
  try {
    const profile = await getMyProfile();
    isProfilePublic.value = !!profile.isPublic;
    bioDraft.value = profile.bio || "";
    hasPassword.value = profile.hasPassword !== false;
  } catch {
  } finally {
    loadingPrivacy.value = false;
    loadingBio.value = false;
  }
};

const handleDeleteAccount = async () => {
  if (!canDeleteAccount.value) return;
  const ok = window.confirm(
    "Confirmer la suppression définitive de votre compte ? Cette action est irréversible.",
  );
  if (!ok) return;

  deleteLoading.value = true;
  deleteError.value = "";
  try {
    await deleteMyAccount({
      confirmation: deleteConfirmation.value.trim(),
      ...(hasPassword.value ? { password: deletePassword.value } : {}),
    });
    await navigateTo("/");
  } catch (err: any) {
    deleteError.value =
      err.response?.data?.error || "Impossible de supprimer le compte";
  } finally {
    deleteLoading.value = false;
  }
};

const handleSaveBio = async () => {
  bioSaving.value = true;
  bioFeedback.value = "";
  bioError.value = "";
  try {
    const updated = await updateMyProfile({ bio: bioDraft.value });
    bioDraft.value = updated?.bio || "";
    bioFeedback.value = "Description enregistrée.";
  } catch (err: any) {
    bioError.value = err.response?.data?.error || "Impossible d'enregistrer la description";
  } finally {
    bioSaving.value = false;
  }
};

const handleTogglePrivacy = async (event: Event) => {
  const next = (event.target as HTMLInputElement).checked;
  privacyLoading.value = true;
  privacyFeedback.value = "";
  try {
    await updateMyProfile({ isPublic: next });
    isProfilePublic.value = next;
    privacyFeedback.value = next
      ? "Ton profil est maintenant public."
      : "Ton profil est maintenant privé.";
  } catch {
  } finally {
    privacyLoading.value = false;
  }
};

const loadingStatus = ref(true);
const actionLoading = ref(false);
const twoFactorEnabled = ref(false);
const backupCodesRemaining = ref(0);
const backupCodesToShow = ref<string[] | null>(null);
const setupState = ref<{ secret: string; qrCode: string } | null>(null);
const enableToken = ref("");
const disablePassword = ref("");
const regeneratePassword = ref("");
const feedback = ref("");
const feedbackIsError = ref(false);

const showFeedback = (message: string, isError = false) => {
  feedback.value = message;
  feedbackIsError.value = isError;
};

const refreshStatus = async () => {
  loadingStatus.value = true;
  try {
    const status = await get2FAStatus();
    twoFactorEnabled.value = status.totpEnabled;
    backupCodesRemaining.value = status.backupCodesRemaining;
  } catch {
    showFeedback("Impossible de récupérer le statut 2FA", true);
  } finally {
    loadingStatus.value = false;
  }
};

const handleStartSetup = async () => {
  actionLoading.value = true;
  feedback.value = "";
  try {
    setupState.value = await setup2FA();
  } catch (err: any) {
    showFeedback(
      err.response?.data?.error || "Erreur lors de l'activation",
      true,
    );
  } finally {
    actionLoading.value = false;
  }
};

const handleConfirmEnable = async () => {
  if (!setupState.value) return;
  actionLoading.value = true;
  feedback.value = "";
  try {
    const result = await enable2FA(setupState.value.secret, enableToken.value);
    setupState.value = null;
    enableToken.value = "";
    twoFactorEnabled.value = true;
    backupCodesRemaining.value = result.backupCodes.length;
    backupCodesToShow.value = result.backupCodes;
  } catch (err: any) {
    showFeedback(err.response?.data?.error || "Code invalide", true);
  } finally {
    actionLoading.value = false;
  }
};

const handleRegenerate = async () => {
  actionLoading.value = true;
  feedback.value = "";
  try {
    const result = await regenerateBackupCodes(regeneratePassword.value);
    regeneratePassword.value = "";
    backupCodesRemaining.value = result.backupCodes.length;
    backupCodesToShow.value = result.backupCodes;
  } catch (err: any) {
    showFeedback(
      err.response?.data?.error || "Mot de passe invalide",
      true,
    );
  } finally {
    actionLoading.value = false;
  }
};

const handleDisable = async () => {
  actionLoading.value = true;
  feedback.value = "";
  try {
    await disable2FA(disablePassword.value);
    disablePassword.value = "";
    twoFactorEnabled.value = false;
    backupCodesRemaining.value = 0;
    showFeedback("2FA désactivée");
  } catch (err: any) {
    showFeedback(
      err.response?.data?.error || "Mot de passe invalide",
      true,
    );
  } finally {
    actionLoading.value = false;
  }
};

onMounted(() => {
  refreshStatus();
  refreshPrivacy();
});
</script>
