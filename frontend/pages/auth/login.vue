<template>
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:44px 20px">
    <div style="width:100%;max-width:420px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:36px 32px;display:flex;flex-direction:column;gap:16px">

      <!-- Sceau -->
      <div style="display:flex;justify-content:center;margin-bottom:4px">
        <BrandSeal :size="56" format="svg" loading="eager" />
      </div>

      <h1 style="font-family:var(--font-display);font-weight:700;font-size:24px;text-align:center;margin:0 0 4px">Connexion &#224; AnimeTrack</h1>

      <!-- OAuth -->
      <button
        type="button"
        style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:46px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:15px;font-weight:500;cursor:pointer"
        @click="handleGoogleClick"
      >
        <span style="font-family:var(--font-display);font-weight:700;color:var(--color-accent-secondary)">G</span>
        Continuer avec Google
      </button>
      <button
        type="button"
        style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:46px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:15px;font-weight:500;cursor:pointer"
        @click="handleGithubLogin"
      >
        <span style="font-family:var(--font-display);font-weight:700">GH</span>
        Continuer avec GitHub
      </button>

      <!-- Divider -->
      <div style="display:flex;align-items:center;gap:12px;margin:4px 0">
        <span style="flex:1;height:1px;background:var(--border)"></span>
        <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">ou</span>
        <span style="flex:1;height:1px;background:var(--border)"></span>
      </div>

      <!-- Form -->
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

        <input
          v-if="requiresTwoFactor"
          v-model="form.totpToken"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="Code 2FA (6 chiffres)"
          class="at-input"
          maxlength="6"
          required
        />

        <div v-if="error" style="padding:10px 14px;background:rgba(214,67,43,0.1);border:1px solid rgba(214,67,43,0.3);border-radius:8px;font-size:13px;color:var(--color-accent-primary)">
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

      <!-- Footer -->
      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:4px;font-size:13px">
        <span style="color:var(--text-secondary)">Pas encore de compte ?</span>
        <NuxtLink to="/auth/register" style="color:var(--color-accent-secondary);text-decoration:none">Cr&#233;er un compte</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login, loginWithGoogle, loginWithGithub, isLoading, error: authError } =
  useAuth();
const config = useRuntimeConfig();

const form = reactive({
  email: "",
  password: "",
  totpToken: "",
});

const error = ref("");
const requiresTwoFactor = ref(false);

const handleLogin = async () => {
  try {
    error.value = "";
    await login(form.email, form.password, form.totpToken || undefined);
    await navigateTo("/");
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
    await navigateTo("/");
  } catch {
    error.value = authError.value || "Identifiants invalides";
  }
};

const handleGoogleClick = () => {
  (window as any).google?.accounts?.id?.prompt();
};

onMounted(() => {
  if (useAuth().isAuthenticated.value) {
    navigateTo("/");
    return;
  }

  if (!config.public.googleClientId) return;

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = () => {
    (window as any).google?.accounts?.id?.initialize({
      client_id: config.public.googleClientId,
      callback: handleGoogleCredential,
    });
  };
  document.head.appendChild(script);
});
</script>
