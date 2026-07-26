<template>
  <div style="max-width:640px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <h1 style="font-family:var(--font-display);font-weight:700;font-size:24px;margin:0 0 20px;color:var(--text-primary)">Paramètres</h1>

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

      <template v-else>
        <div v-if="twoFactorEnabled && !setupState" style="display:flex;flex-direction:column;gap:14px">
          <p style="font-size:14px;color:var(--text-secondary)">
            La 2FA est actuellement <strong style="color:#2ea043">activée</strong>.
          </p>
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

const { get2FAStatus, setup2FA, enable2FA, disable2FA } = useAuth();

const loadingStatus = ref(true);
const actionLoading = ref(false);
const twoFactorEnabled = ref(false);
const setupState = ref<{ secret: string; qrCode: string } | null>(null);
const enableToken = ref("");
const disablePassword = ref("");
const feedback = ref("");
const feedbackIsError = ref(false);

const showFeedback = (message: string, isError = false) => {
  feedback.value = message;
  feedbackIsError.value = isError;
};

const refreshStatus = async () => {
  loadingStatus.value = true;
  try {
    twoFactorEnabled.value = await get2FAStatus();
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
    await enable2FA(setupState.value.secret, enableToken.value);
    setupState.value = null;
    enableToken.value = "";
    twoFactorEnabled.value = true;
    showFeedback("2FA activée avec succès");
  } catch (err: any) {
    showFeedback(err.response?.data?.error || "Code invalide", true);
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

onMounted(refreshStatus);
</script>
