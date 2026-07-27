<template>
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:44px 20px">
    <div style="width:100%;max-width:420px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:36px 32px;display:flex;flex-direction:column;gap:14px">

      <div style="display:flex;justify-content:center;margin-bottom:4px">
        <BrandSeal :size="56" format="svg" loading="eager" />
      </div>

      <h1 style="font-family:var(--font-display);font-weight:700;font-size:24px;text-align:center;margin:0 0 4px">Cr&#233;er un compte</h1>

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

      <form @submit.prevent="handleRegister" style="display:flex;flex-direction:column;gap:12px">
        <input v-model="form.username" type="text" placeholder="Nom d'utilisateur" class="at-input" required />
        <input v-model="form.email" type="email" placeholder="Email" class="at-input" required />
        <input v-model="form.password" type="password" placeholder="Mot de passe" class="at-input" required />
        <input v-model="form.confirmPassword" type="password" placeholder="Confirmer le mot de passe" class="at-input" required />

        <div v-if="error" style="padding:10px 14px;background:rgba(214,67,43,0.1);border:1px solid rgba(214,67,43,0.3);border-radius:8px;font-size:13px;color:var(--color-accent-primary)">
          {{ error }}
        </div>

        <button type="submit" :disabled="isLoading" class="at-btn-primary" style="width:100%;min-height:46px;margin-top:4px">
          {{ isLoading ? 'Inscription...' : "S'inscrire" }}
        </button>
      </form>

      <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px">
        <span style="color:var(--text-secondary)">D&#233;j&#224; un compte ?</span>
        <NuxtLink to="/auth/login" style="color:var(--color-accent-secondary);text-decoration:none">Se connecter</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { register, loginWithGoogle, loginWithGithub, isLoading, error: authError } =
  useAuth();
const config = useRuntimeConfig();
const { ensureLoaded, prompt } = useGoogleAuth();

const form = reactive({ username: "", email: "", password: "", confirmPassword: "" });
const error = ref("");

const handleRegister = async () => {
  try {
    error.value = "";
    if (form.password !== form.confirmPassword) { error.value = "Les mots de passe ne correspondent pas"; return; }
    if (form.password.length < 6) { error.value = "Le mot de passe doit contenir au moins 6 caract\u00e8res"; return; }
    await register(form.email, form.username, form.password);
    await navigateTo("/");
  } catch {
    error.value = authError.value || "Erreur lors de l'inscription";
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
  prompt();
};

onMounted(() => {
  if (useAuth().isAuthenticated.value) {
    navigateTo("/");
    return;
  }

  ensureLoaded(handleGoogleCredential);
});
</script>