<template>
  <div style="display:flex;gap:12px;padding:16px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px">
    <div style="width:36px;height:36px;border-radius:50%;background:var(--color-accent-secondary);color:#fff;font-family:var(--font-display);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      {{ initials }}
    </div>

    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-weight:500;font-size:14px;color:var(--text-primary)">
          {{ username }}
        </span>
        <span style="font-family:var(--font-mono);font-size:13px;color:var(--color-accent-primary)">
          ★ {{ review.rating }}/10
        </span>
      </div>
      <div style="margin-top:6px;font-size:14px;line-height:1.55;color:var(--text-secondary)">
        {{ review.comment || "Aucun commentaire." }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  review: {
    id: number;
    rating: number;
    comment?: string | null;
    user?: {
      username?: string | null;
    };
  };
}>();

const username = computed(() => props.review.user?.username || "Anonyme");
const initials = computed(() => (username.value || "?").slice(0, 2).toUpperCase());
</script>
