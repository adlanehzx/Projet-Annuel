<template>
  <main
    class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full">
      <div class="card p-8">
        <h1 class="text-3xl font-bold mb-2">Créer un compte</h1>
        <p class="text-slate-400 mb-8">Rejoignez CineTrack dès maintenant</p>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2"
              >Nom d'utilisateur</label
            >
            <input
              v-model="form.username"
              type="text"
              class="input"
              placeholder="votre_pseudo"
              required
            />
          </div>

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

          <div>
            <label class="block text-sm font-medium mb-2"
              >Confirmer le mot de passe</label
            >
            <input
              v-model="form.confirmPassword"
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
            {{ isLoading ? "Inscription..." : "S'inscrire" }}
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-slate-700">
          <p class="text-slate-400 text-sm">
            Vous avez déjà un compte?
            <NuxtLink to="/auth/login" class="text-primary hover:underline">
              Se connecter
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { register, isLoading, error: authError } = useAuth();

const form = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const error = ref("");

const handleRegister = async () => {
  try {
    error.value = "";

    if (form.password !== form.confirmPassword) {
      error.value = "Les mots de passe ne correspondent pas";
      return;
    }

    if (form.password.length < 6) {
      error.value = "Le mot de passe doit contenir au moins 6 caractères";
      return;
    }

    await register(form.email, form.username, form.password);
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
