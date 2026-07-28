<template>
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:44px 20px">
    <div style="width:100%;max-width:420px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:36px 32px;display:flex;flex-direction:column;gap:16px">

      <div style="display:flex;justify-content:center;margin-bottom:4px">
        <BrandSeal :size="56" format="svg" loading="eager" />
      </div>

      <h1 style="font-family:var(--font-display);font-weight:700;font-size:24px;letter-spacing:-0.01em;text-align:center;margin:0 0 4px">Connexion &#224; HankoTrack</h1>

      <button
        type="button"
        class="at-btn-oauth"
        @click="handleGoogleClick"
      >
        <span style="font-family:var(--font-display);font-weight:700;color:var(--color-accent-secondary)">G</span>
        Continuer avec Google
      </button>
      <button
        type="button"
        class="at-btn-oauth"
        @click="handleGithubLogin"
      >
        <span style="font-family:var(--font-display);font-weight:700">GH</span>
        Continuer avec GitHub
      </button>

      <div style="display:flex;align-items:center;gap:12px;margin:4px 0">
        <span style="flex:1;height:1px;background:var(--border)"></span>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">ou</span>
        <span style="flex:1;height:1px;background:var(--border)"></span>
      </div>

      <form @submit.prevent="handleLogin" style="display:flex;flex-direction:column;gap:12px">
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          class="at-input"
          required
          :disabled="requiresTwoFactor"
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Mot de passe"
          class="at-input"
          required
          :disabled="requiresTwoFactor"
        />

        <template v-if="requiresTwoFactor">
          <input
            v-if="!useBackupCode"
            v-model="form.totpToken"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="Code 2FA (6 chiffres)"
            class="at-input"
            maxlength="6"
            required
          />
          <input
            v-else
            v-model="form.backupCode"
            type="text"
            placeholder="Code de secours (XXXX-XXXX)"
            class="at-input"
            required
          />
          <button
            type="button"
            class="at-btn-ghost is-accent"
            style="padding:0;text-align:left;font-size:12px;width:fit-content"
            @click="useBackupCode = !useBackupCode"
          >
            {{ useBackupCode ? "Utiliser le code de l'application" : "Utiliser un code de secours" }}
          </button>
        </template>

        <div v-if="error" style="padding:10px 14px;background:rgba(192,25,43,0.1);border:1px solid rgba(192,25,43,0.3);border-radius:8px;font-size:13px;color:var(--color-accent-primary)">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="at-btn-primary"
          style="width:100%;min-height:46px;margin-top:4px"
        >
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:4px;font-size:13px">
        <span style="color:var(--text-secondary)">Pas encore de compte ?</span>
        <NuxtLink to="/auth/register" class="at-auth-switch">Cr&#233;er un compte</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, loginWithGoogle, loginWithGithub, isLoading, error: authError } =
  useAuth();
const config = useRuntimeConfig();
const { ensureLoaded, prompt } = useGoogleAuth();

const form = reactive({
  email: "",
  password: "",
  totpToken: "",
  backupCode: "",
});

const error = ref("");
const requiresTwoFactor = ref(false);
const useBackupCode = ref(false);

const handleLogin = async () => {
  try {
    error.value = "";
    await login(
      form.email,
      form.password,
      form.totpToken || undefined,
      form.backupCode || undefined,
    );
    await navigateTo("/animes");
  } catch (err: any) {
    if (err.response?.data?.requiresTwoFactor) {
      requiresTwoFactor.value = true;
      error.value = "Entrez le code généré par votre application 2FA";
    } else {
      error.value = authError.value;
    }
  }
};

const handleGithubLogin = () => {
  const params = new URLSearchParams({
    client_id: config.public.githubClientId as string,
    redirect_uri: config.public.githubRedirectUri as string,
    scope: "read:user user:email",
  });
  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
};

const handleGoogleCredential = async (response: { credential: string }) => {
  try {
    error.value = "";
    await loginWithGoogle(response.credential);
    await navigateTo("/animes");
  } catch {
    error.value = authError.value || "Identifiants invalides";
  }
};

const handleGoogleClick = () => {
  prompt();
};

onMounted(() => {
  if (useAuth().isAuthenticated.value) {
    navigateTo("/animes");
    return;
  }

  ensureLoaded(handleGoogleCredential);
});
</script>
