<template>
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:44px 20px">
    <div style="width:100%;max-width:420px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:36px 32px;text-align:center">
      <p v-if="!error" style="font-size:14px;color:var(--text-secondary)">Connexion avec GitHub...</p>
      <div
        v-else
        style="padding:10px 14px;background:rgba(214,67,43,0.1);border:1px solid rgba(214,67,43,0.3);border-radius:8px;font-size:13px;color:var(--color-accent-primary)"
      >
        {{ error }}
      </div>
    </div>
  </div>
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
