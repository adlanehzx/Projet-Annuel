<template>
  <div style="max-width:760px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <NuxtLink to="/lists" style="display:inline-block;margin-bottom:14px;color:var(--text-secondary);font-size:14px;text-decoration:none">
      ← Retour aux listes
    </NuxtLink>

    <h1 style="font-family:var(--font-display);font-weight:700;font-size:28px;letter-spacing:-0.01em;margin:0 0 18px;color:var(--text-primary)">
      Créer une liste
    </h1>

    <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:18px">
      <label style="display:block;margin-bottom:12px">
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">Titre *</div>
        <input
          v-model="form.title"
          type="text"
          placeholder="Mon top shonen..."
          style="width:100%;padding:11px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;outline:none"
        />
      </label>

      <label style="display:block;margin-bottom:12px">
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">Description</div>
        <textarea
          v-model="form.description"
          placeholder="Description de la liste..."
          style="width:100%;min-height:100px;padding:11px 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text-primary);font-family:var(--font-body);font-size:14px;resize:vertical;outline:none"
        />
      </label>

      <label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer">
        <input v-model="form.isPublic" type="checkbox" />
        <span style="font-size:14px;color:var(--text-primary)">Rendre cette liste publique</span>
      </label>

      <div v-if="errorMessage" style="margin-bottom:12px;font-size:13px;color:var(--color-accent-primary)">
        {{ errorMessage }}
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button
          @click="handleCreate"
          :disabled="loading"
          style="padding:10px 18px;background:var(--color-accent-primary);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer"
        >
          {{ loading ? "Création..." : "Créer la liste" }}
        </button>
        <NuxtLink to="/lists" style="padding:10px 18px;border:1px solid var(--border);border-radius:8px;color:var(--text-secondary);font-size:14px;text-decoration:none">
          Annuler
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLists } from "~/composables/useLists";

definePageMeta({ middleware: "auth" });

const { createList } = useLists();

const form = reactive({
  title: "",
  description: "",
  isPublic: false,
});

const loading = ref(false);
const errorMessage = ref("");

const handleCreate = async () => {
  if (!form.title.trim()) {
    errorMessage.value = "Le titre est requis";
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = "";
    const created = await createList(
      form.title.trim(),
      form.description.trim(),
      form.isPublic,
    );
    await navigateTo(`/lists/${created.id}`);
  } catch (e: any) {
    errorMessage.value = e.response?.data?.error || e.message || "Erreur lors de la création";
  } finally {
    loading.value = false;
  }
};
</script>
