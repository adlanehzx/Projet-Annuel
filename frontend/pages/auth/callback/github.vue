<template>
  <main
    class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center px-4"
  >
    <div class="max-w-md w-full text-center">
      <div class="card p-8">
        <p v-if="!error" class="text-slate-300">Connexion avec GitHub...</p>
        <div
          v-else
          class="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { loginWithGithub, error: authError } = useAuth();
const route = useRoute();
const error = ref("");

onMounted(async () => {
  const code = route.query.code as string | undefined;
  if (!code) {
    error.value = "Code d'autorisation GitHub manquant";
    return;
  }

  try {
    await loginWithGithub(code);
    await navigateTo("/");
  } catch (err) {
    error.value = authError.value || "Erreur de connexion avec GitHub";
  }
});
</script>
