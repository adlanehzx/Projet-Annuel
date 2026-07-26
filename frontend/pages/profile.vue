<template>
  <main class="max-w-4xl mx-auto px-4 py-12 space-y-6">
    <div class="card p-8">
      <h1 class="text-3xl font-bold">Mon Profil</h1>
      <p class="text-slate-400 mt-2">Gérez vos films et évaluations</p>
    </div>

    <div class="card p-8">
      <h2 class="text-xl font-bold mb-1">Authentification à deux facteurs</h2>
      <p class="text-slate-400 text-sm mb-6">
        Ajoutez une couche de sécurité supplémentaire à votre compte.
      </p>

      <div
        v-if="feedback"
        class="mb-4 p-3 rounded text-sm"
        :class="
          feedbackIsError
            ? 'bg-red-500/20 border border-red-500/50 text-red-400'
            : 'bg-green-500/20 border border-green-500/50 text-green-400'
        "
      >
        {{ feedback }}
      </div>

      <p v-if="loadingStatus" class="text-slate-400 text-sm">Chargement...</p>

      <template v-else>
        <!-- 2FA déjà activée -->
        <div v-if="twoFactorEnabled && !setupState" class="space-y-4">
          <p class="text-sm text-slate-300">
            La 2FA est actuellement <span class="text-green-400">activée</span>.
          </p>
          <div class="max-w-xs">
            <label class="block text-sm font-medium mb-2"
              >Mot de passe pour désactiver</label
            >
            <input
              v-model="disablePassword"
              type="password"
              class="input"
              placeholder="••••••••"
            />
          </div>
          <button
            class="btn btn-secondary"
            :disabled="!disablePassword || actionLoading"
            @click="handleDisable"
          >
            Désactiver la 2FA
          </button>
        </div>

        <!-- 2FA désactivée, pas encore en cours de setup -->
        <div v-else-if="!twoFactorEnabled && !setupState" class="space-y-4">
          <p class="text-sm text-slate-300">
            La 2FA est actuellement <span class="text-red-400">désactivée</span>.
          </p>
          <button
            class="btn btn-primary"
            :disabled="actionLoading"
            @click="handleStartSetup"
          >
            Activer la 2FA
          </button>
        </div>

        <!-- Setup en cours: QR code + saisie du code -->
        <div v-else-if="setupState" class="space-y-4">
          <p class="text-sm text-slate-300">
            Scannez ce QR code avec votre application d'authentification
            (Google Authenticator, Authy...), puis entrez le code généré.
          </p>
          <img
            :src="setupState.qrCode"
            alt="QR code 2FA"
            class="w-48 h-48 bg-white p-2 rounded"
          />
          <div class="max-w-xs">
            <label class="block text-sm font-medium mb-2">Code de vérification</label>
            <input
              v-model="enableToken"
              type="text"
              inputmode="numeric"
              maxlength="6"
              class="input"
              placeholder="123456"
            />
          </div>
          <div class="flex gap-3">
            <button
              class="btn btn-primary"
              :disabled="!enableToken || actionLoading"
              @click="handleConfirmEnable"
            >
              Confirmer
            </button>
            <button class="btn btn-secondary" @click="setupState = null">
              Annuler
            </button>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
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
