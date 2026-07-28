<template>
  <Teleport to="body">
    <Transition name="at-modal">
      <div
        @click.self="$emit('cancel')"
        style="position:fixed;inset:0;z-index:100;background:rgba(12,12,18,0.55);display:flex;align-items:center;justify-content:center;padding:16px"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="`Votre review — ${animeTitle}`"
          class="at-modal-dialog"
          style="width:100%;max-width:480px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:14px;padding:24px 24px 20px;box-shadow:0 24px 60px rgba(0,0,0,0.35)"
        >
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:20px;margin:0 0 22px;color:var(--text-primary)">
            Votre review — {{ animeTitle }}
          </h2>

          <div style="margin-bottom:18px">
            <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:var(--text-secondary);margin-bottom:10px">NOTE</div>
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:36px;height:36px;border-radius:8px;background:var(--color-accent-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:18px;flex-shrink:0">
                {{ displayRating }}
              </div>
              <input
                v-model.number="formState.rating"
                type="range"
                min="0"
                max="10"
                step="1"
                style="flex:1;accent-color:var(--color-accent-primary)"
              />
              <span style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);flex-shrink:0">/10</span>
            </div>
          </div>

          <div style="margin-bottom:16px">
            <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:2px;color:var(--text-secondary);margin-bottom:10px">CRITIQUE</div>
            <textarea
              v-model="formState.comment"
              placeholder="Partagez votre avis sur cet animé..."
              style="width:100%;min-height:110px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-family:var(--font-body);font-size:14px;line-height:1.55;color:var(--text-primary);resize:vertical;outline:none;box-sizing:border-box"
            ></textarea>
          </div>

          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:20px;font-family:var(--font-body);font-size:14px;color:var(--text-primary)">
            <input
              v-model="formState.hasSpoilers"
              type="checkbox"
              style="position:absolute;opacity:0;width:0;height:0"
            />
            <span
              :style="`width:18px;height:18px;border-radius:4px;border:2px solid ${formState.hasSpoilers ? 'var(--color-accent-primary)' : 'var(--border)'};background:${formState.hasSpoilers ? 'var(--color-accent-primary)' : 'var(--bg-input)'};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0`"
            >
              <span v-if="formState.hasSpoilers" style="color:#fff;font-size:12px;line-height:1">✓</span>
            </span>
            Contient des spoilers
          </label>

          <div v-if="errorMessage" style="margin-bottom:14px;font-size:13px;color:var(--color-accent-primary)">
            {{ errorMessage }}
          </div>

          <div style="display:flex;justify-content:flex-end;gap:12px">
            <button
              type="button"
              @click="$emit('cancel')"
              style="padding:10px 16px;background:transparent;border:none;color:var(--text-secondary);font-family:var(--font-body);font-size:14px;cursor:pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              @click="submit"
              :disabled="loading"
              style="padding:10px 22px;background:var(--color-accent-primary);color:#fff;border:none;border-radius:8px;font-family:var(--font-body);font-weight:600;font-size:14px;cursor:pointer"
            >
              {{ loading ? "Publication…" : (formState.id ? "Mettre à jour" : "Publier") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";

const props = defineProps<{
  animeTitle: string;
  modelValue: {
    id: number | null;
    rating: number;
    comment: string;
    hasSpoilers?: boolean;
  };
  loading?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  (e: "submit", payload: { id: number | null; rating: number; comment: string; hasSpoilers: boolean }): void;
  (e: "cancel"): void;
}>();

const formState = reactive({
  id: props.modelValue.id,
  rating: props.modelValue.rating,
  comment: props.modelValue.comment,
  hasSpoilers: props.modelValue.hasSpoilers ?? false,
});

watch(
  () => props.modelValue,
  (value) => {
    formState.id = value.id;
    formState.rating = value.rating;
    formState.comment = value.comment;
    formState.hasSpoilers = value.hasSpoilers ?? false;
  },
  { deep: true },
);

const displayRating = computed(() => Math.round(formState.rating));

const submit = () => {
  emit("submit", {
    id: formState.id,
    rating: Number(formState.rating),
    comment: formState.comment,
    hasSpoilers: formState.hasSpoilers,
  });
};
</script>
