<template>
  <div style="max-width:1100px;margin:0 auto;padding:24px 24px 48px;width:100%">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap">
      <h1 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-0.01em;margin:0;color:var(--text-primary)">Mes listes</h1>
      <button
        @click="showCreateModal = true"
        class="at-btn-primary"
        style="padding:12px 24px;font-size:15px"
      >
        + Créer une liste
      </button>
    </div>

    <div v-if="loading" style="text-align:center;padding:48px;color:var(--text-secondary)">Chargement…</div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px">
      <div
        v-for="list in lists"
        :key="list.id"
        role="button"
        tabindex="0"
        class="at-card"
        @click="navigateTo(`/lists/${list.id}`)"
        @keydown.enter="navigateTo(`/lists/${list.id}`)"
        style="cursor:pointer"
      >
        <div style="display:flex;height:110px;background:var(--bg)">
          <div v-for="(item, idx) in (list.animes || []).slice(0, 4)" :key="idx" style="flex:1;overflow:hidden;border-right:1px solid var(--border);background:linear-gradient(135deg,var(--bg),var(--bg-elevated))">
            <img v-if="item.posterPath" :src="item.posterPath" :alt="item.title" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <template v-for="_ in Math.max(0, 4 - (list.animes || []).length)" :key="'empty-' + _">
            <div style="flex:1;border-right:1px solid var(--border)"></div>
          </template>
        </div>

        <div style="padding:14px 16px">
          <div style="font-family:var(--font-display);font-weight:700;font-size:16px;color:var(--text-primary)">{{ list.title }}</div>
          <div style="display:flex;align-items:center;gap:10px;margin-top:7px">
            <span style="font-family:var(--font-mono);font-size:12px;color:var(--text-secondary)">{{ (list.animes || []).length }} animé{{ (list.animes || []).length !== 1 ? 's' : '' }}</span>
            <span style="padding:3px 8px;background:var(--color-accent-secondary);color:#fff;border-radius:999px;font-family:var(--font-mono);font-size:11px;font-weight:600">{{ list.isPublic ? 'Public' : 'Privé' }}</span>
          </div>
        </div>
      </div>

      <button
        @click="showCreateModal = true"
        class="at-btn-secondary"
        style="border-style:dashed;border-width:2px;min-height:180px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:14px;background:transparent"
      >
        + Nouvelle liste
      </button>
    </div>

    <Teleport to="body">
      <Transition name="at-modal">
        <div
          v-if="showCreateModal"
          style="position:fixed;inset:0;background:rgba(12,12,18,0.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:80"
          @click.self="closeCreateModal"
        >
          <div class="at-modal-dialog" style="width:100%;max-width:460px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:18px">
            <h2 style="margin:0 0 14px;font-family:var(--font-display);font-size:20px;color:var(--text-primary)">Nouvelle liste</h2>

            <label style="display:block;margin-bottom:10px">
              <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">Nom de la liste *</div>
              <input
                v-model="form.title"
                type="text"
                placeholder="Ex: Mes classiques"
                class="at-input"
              />
            </label>

            <label style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer">
              <input v-model="form.isPublic" type="checkbox" />
              <span style="font-size:14px;color:var(--text-primary)">Rendre publique</span>
            </label>

            <p v-if="createError" style="margin:0 0 12px;color:var(--color-accent-primary);font-size:13px">{{ createError }}</p>

            <div style="display:flex;gap:10px">
              <button
                @click="handleCreate"
                :disabled="createLoading"
                class="at-btn-primary"
                style="flex:1;padding:10px 12px"
              >
                {{ createLoading ? 'Création...' : 'Créer' }}
              </button>
              <button
                @click="closeCreateModal"
                class="at-btn-secondary"
                style="flex:1;padding:10px 12px"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useLists } from "~/composables/useLists";

definePageMeta({ middleware: "auth" });

const { lists, loading, fetchLists, createList } = useLists();

const showCreateModal = ref(false);
const createLoading = ref(false);
const createError = ref("");
const form = reactive({
  title: "",
  isPublic: false,
});

const closeCreateModal = () => {
  showCreateModal.value = false;
  createError.value = "";
  form.title = "";
  form.isPublic = false;
};

const handleCreate = async () => {
  if (!form.title.trim()) {
    createError.value = "Le nom de la liste est requis";
    return;
  }

  try {
    createLoading.value = true;
    createError.value = "";
    await createList(form.title.trim(), "", form.isPublic);
    closeCreateModal();
  } catch (e: any) {
    createError.value = e.response?.data?.error || "Erreur lors de la création";
  } finally {
    createLoading.value = false;
  }
};

onMounted(() => fetchLists());
</script>
