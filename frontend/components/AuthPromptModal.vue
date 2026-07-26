<template>
  <Transition name="at-fade">
    <div
      v-if="promptOpen"
      @click.self="closePrompt"
      style="position:fixed;inset:0;z-index:100;background:rgba(12,12,18,0.55);display:flex;align-items:center;justify-content:center;padding:16px"
    >
      <div style="width:100%;max-width:420px;background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:28px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.35)">
        <div style="display:flex;justify-content:center;margin-bottom:18px">
          <BrandSeal :size="56" format="svg" style="transform:rotate(8deg)" loading="eager" />
        </div>
        <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin:0 0 10px;color:var(--text-primary)">Connectez-vous pour continuer</h2>
        <p style="font-family:var(--font-body);font-size:14px;line-height:1.6;color:var(--text-secondary);margin:0">
          Créez un compte gratuit pour suivre vos animes, les noter et composer vos listes.
        </p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">
          <button @click="go('/auth/register')" class="at-btn-primary" style="width:100%;padding:12px">Créer un compte</button>
          <button @click="go('/auth/login')" class="at-btn-secondary" style="width:100%;padding:12px">Se connecter</button>
        </div>
        <button
          @click="closePrompt"
          style="margin-top:16px;background:none;border:none;color:var(--text-secondary);font-family:var(--font-body);font-size:13px;cursor:pointer;text-decoration:underline"
        >Continuer sans compte</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { promptOpen, closePrompt } = useAuthGuard();

const go = (path: string) => {
  closePrompt();
  navigateTo(path);
};
</script>

<style scoped>
.at-fade-enter-active, .at-fade-leave-active { transition: opacity 0.15s ease; }
.at-fade-enter-from, .at-fade-leave-to { opacity: 0; }
</style>
