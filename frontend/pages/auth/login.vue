<template>
  <main
    class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full">
      <div class="card p-8">
        <h1 class="text-3xl font-bold mb-2">Bienvenue</h1>
        <p class="text-slate-400 mb-8">Connectez-vous à CineTrack</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              placeholder="votre@email.com"
              required
              :disabled="requiresTwoFactor"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Mot de passe</label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              placeholder="••••••••"
              required
              :disabled="requiresTwoFactor"
            />
          </div>

          <div v-if="requiresTwoFactor">
            <label class="block text-sm font-medium mb-2"
              >Code de vérification (2FA)</label
            >
            <input
              v-model="form.totpToken"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              class="input"
              placeholder="123456"
              maxlength="6"
              required
            />
          </div>

          <div
            v-if="error"
            class="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
          >
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary w-full"
          >
            {{ isLoading ? "Connexion..." : "Se connecter" }}
          </button>
        </form>

        <div
          v-if="!requiresTwoFactor"
          class="mt-6 space-y-3"
        >
          <div class="flex items-center gap-3">
            <div class="h-px bg-slate-700 flex-1" />
            <span class="text-xs text-slate-500">ou</span>
            <div class="h-px bg-slate-700 flex-1" />
          </div>

          <div ref="googleButton" class="flex justify-center" />

          <button
            type="button"
            class="btn btn-secondary w-full"
            @click="handleGithubLogin"
          >
            Continuer avec GitHub
          </button>
        </div>

        <div class="mt-6 pt-6 border-t border-slate-700">
          <p class="text-slate-400 text-sm">
            Pas encore de compte?
            <NuxtLink to="/auth/register" class="text-primary hover:underline">
              S'inscrire
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </main>
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
const googleButton = ref<HTMLElement | null>(null);

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
  } catch (err) {
    error.value = authError.value;
  }
};

// Rediriger si déjà connecté
const auth = useAuth();
onMounted(() => {
  if (auth.isAuthenticated.value) {
    navigateTo("/");
    return;
  }

  if (!config.public.googleClientId) return;

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = () => {
    const google = (window as any).google;
    if (!google || !googleButton.value) return;

    google.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: handleGoogleCredential,
    });
    google.accounts.id.renderButton(googleButton.value, {
      theme: "filled_black",
      size: "large",
      width: 320,
    });
  };
  document.head.appendChild(script);
});
</script>
