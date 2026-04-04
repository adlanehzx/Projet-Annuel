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
const { login, isLoading, error: authError } = useAuth();

const form = reactive({
  email: "",
  password: "",
});

const error = ref("");

const handleLogin = async () => {
  try {
    error.value = "";
    await login(form.email, form.password);
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
  }
});
</script>
