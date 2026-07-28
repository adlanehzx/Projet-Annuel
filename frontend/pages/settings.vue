<template>
  <div style="max-width:640px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:24px;margin:0 0 20px;color:var(--text-primary)">Paramètres</h1>

    <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:20px">
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 4px;color:var(--text-primary)">Photo de profil</h2>
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 16px">JPEG, PNG ou WebP, 5 Mo maximum.</p>

      <div
        v-if="avatarFeedback"
        style="margin-bottom:16px;padding:10px 14px;border-radius:8px;font-size:13px"
        :style="avatarFeedbackIsError
          ? 'background:rgba(214,67,43,0.1);border:1px solid rgba(214,67,43,0.3);color:var(--color-accent-primary)'
          : 'background:rgba(46,160,67,0.1);border:1px solid rgba(46,160,67,0.3);color:#2ea043'"
      >
        {{ avatarFeedback }}
      </div>

      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--color-accent-secondary);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:24px;flex-shrink:0;overflow:hidden">
          <img v-if="avatarSrc" :src="avatarSrc" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />
          <template v-else>{{ (user?.username || '?').slice(0, 2).toUpperCase() }}</template>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <input
            ref="avatarInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style="display:none"
            @change="handleAvatarSelected"
          />
          <button
            class="at-btn-secondary"
            style="max-width:200px"
            :disabled="avatarLoading"
            @click="avatarInput?.click()"
          >
            {{ avatarLoading ? "Envoi..." : "Changer la photo" }}
          </button>
          <button
            v-if="avatarSrc"
            class="at-btn-secondary"
            style="max-width:160px"
            :disabled="avatarLoading"
            @click="handleRemoveAvatar"
          >
            Supprimer
          </button>
        </div>
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

    <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px">
      <h2 style="font-family:var(--font-display);font-weight:700;font-size:16px;margin:0 0 4px;color:var(--text-primary)">Authentification à deux facteurs</h2>
      <p style="font-size:13px;color:var(--text-secondary);margin:0 0 20px">
        Ajoutez une couche de sécurité supplémentaire à votre compte.
      </p>

      <div
        v-if="feedback"
        style="margin-bottom:16px;padding:10px 14px;border-radius:8px;font-size:13px"
        :style="feedbackIsError
          ? 'background:rgba(214,67,43,0.1);border:1px solid rgba(214,67,43,0.3);color:var(--color-accent-primary)'
          : 'background:rgba(46,160,67,0.1);border:1px solid rgba(46,160,67,0.3);color:#2ea043'"
      >
        {{ feedback }}
      </div>

      <p v-if="loadingStatus" style="font-size:13px;color:var(--text-secondary)">Chargement...</p>

      <!-- Codes de secours à sauvegarder (affichés une seule fois) -->
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
  uploadAvatar,
  removeAvatar,
} = useAuth();
const { resolve: resolveAvatarUrl } = useAvatarUrl();

const avatarInput = ref<HTMLInputElement | null>(null);
const avatarLoading = ref(false);
const avatarFeedback = ref("");
const avatarFeedbackIsError = ref(false);
const avatarSrc = computed(() => resolveAvatarUrl(user.value?.avatar));

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const handleAvatarSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  avatarFeedback.value = "";

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    avatarFeedback.value = "Format non supporté (jpeg, png ou webp uniquement)";
    avatarFeedbackIsError.value = true;
    return;
  }
  if (file.size > MAX_AVATAR_SIZE) {
    avatarFeedback.value = "L'image dépasse la taille maximale autorisée (5 Mo)";
    avatarFeedbackIsError.value = true;
    return;
  }

  avatarLoading.value = true;
  try {
    await uploadAvatar(file);
    avatarFeedback.value = "Photo de profil mise à jour.";
    avatarFeedbackIsError.value = false;
  } catch (err: any) {
    avatarFeedback.value = err.response?.data?.error || "Erreur lors de l'envoi";
    avatarFeedbackIsError.value = true;
  } finally {
    avatarLoading.value = false;
  }
};

const handleRemoveAvatar = async () => {
  avatarLoading.value = true;
  avatarFeedback.value = "";
  try {
    await removeAvatar();
    avatarFeedback.value = "Photo de profil supprimée.";
    avatarFeedbackIsError.value = false;
  } catch (err: any) {
    avatarFeedback.value = err.response?.data?.error || "Erreur lors de la suppression";
    avatarFeedbackIsError.value = true;
  } finally {
    avatarLoading.value = false;
  }
};

const loadingPrivacy = ref(true);
const privacyLoading = ref(false);
const isProfilePublic = ref(false);
const privacyFeedback = ref("");

const refreshPrivacy = async () => {
  loadingPrivacy.value = true;
  try {
    const profile = await getMyProfile();
    isProfilePublic.value = !!profile.isPublic;
  } catch {
    // silencieux : le statut 2FA plus bas remontera déjà une erreur si l'API est down
  } finally {
    loadingPrivacy.value = false;
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
    // revert visuel : le v-model n'a pas changé puisqu'on utilise :checked, rien à faire
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
