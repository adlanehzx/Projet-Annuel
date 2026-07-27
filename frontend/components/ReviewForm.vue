<template>
  <div style="margin-top:28px;max-width:760px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:12px;padding:20px">
    <h3 style="font-family:var(--font-display);font-weight:700;font-size:18px;margin:0 0 14px;color:var(--text-primary)">
      {{ formState.id ? "Mon avis" : "Écrire un avis" }}
    </h3>

    <div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px">
        <input
          v-model.number="formState.rating"
          type="range"
          min="0"
          max="10"
          step="0.5"
          style="flex:1;accent-color:var(--color-accent-primary)"
        />
        <span style="font-family:var(--font-display);font-weight:700;font-size:24px;color:var(--color-accent-primary);width:40px;text-align:right">
          {{ formState.rating }}
        </span>
      </div>
    </div>

    <textarea
      v-model="formState.comment"
      placeholder="Qu'en as-tu pensé ?"
      style="width:100%;height:100px;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-family:var(--font-body);font-size:14px;color:var(--text-primary);resize:none;outline:none;box-sizing:border-box"
    ></textarea>

    <div v-if="errorMessage" style="margin-top:10px;font-size:13px;color:var(--color-accent-primary)">
      {{ errorMessage }}
    </div>

    <div style="display:flex;gap:10px;margin-top:12px">
      <button
        @click="submit"
        :disabled="loading"
        style="padding:10px 20px;background:var(--color-accent-primary);color:#fff;border:none;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer"
      >
        {{ loading ? "Enregistrement…" : (formState.id ? "Mettre à jour" : "Publier") }}
      </button>
      <button
        @click="$emit('cancel')"
        style="padding:10px 16px;background:transparent;border:1px solid var(--border);color:var(--text-secondary);border-radius:8px;font-size:14px;cursor:pointer"
      >
        Annuler
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";

const props = defineProps<{
  modelValue: {
    id: number | null;
    rating: number;
    comment: string;
  };
  loading?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  (e: "submit", payload: { id: number | null; rating: number; comment: string }): void;
  (e: "cancel"): void;
}>();

const formState = reactive({
  id: props.modelValue.id,
  rating: props.modelValue.rating,
  comment: props.modelValue.comment,
});

watch(
  () => props.modelValue,
  (value) => {
    formState.id = value.id;
    formState.rating = value.rating;
    formState.comment = value.comment;
  },
  { deep: true },
);

const submit = () => {
  emit("submit", {
    id: formState.id,
    rating: Number(formState.rating),
    comment: formState.comment,
  });
};
</script>
