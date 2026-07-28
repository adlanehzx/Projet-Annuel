<template>
  <div style="display:flex;gap:12px;padding:16px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px">
    <div style="width:36px;height:36px;border-radius:50%;background:var(--color-accent-secondary);color:#fff;font-family:var(--font-body);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
      <img v-if="avatarSrc" :src="avatarSrc" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />
      <template v-else>{{ initials }}</template>
    </div>

    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:1;min-width:0">
          <NuxtLink
            v-if="props.review.user?.username"
            :to="`/profiles/${props.review.user.username}`"
            style="font-weight:500;font-size:14px;color:var(--text-primary);text-decoration:none"
          >
            {{ username }}
          </NuxtLink>
          <span v-else style="font-weight:500;font-size:14px;color:var(--text-primary)">
            {{ username }}
          </span>
          <span style="font-family:var(--font-mono);font-size:13px;color:var(--rating)">
            ★ {{ review.rating }}/10
          </span>
          <span
            v-if="review.hasSpoilers"
            style="padding:3px 10px;border-radius:999px;background:var(--color-accent-primary);color:#fff;font-family:var(--font-body);font-size:11px;font-weight:600;letter-spacing:0.02em"
          >
            Spoilers
          </span>
        </div>
        <span
          v-if="review.createdAt"
          style="font-family:var(--font-mono);font-size:12px;color:var(--text-tertiary);flex-shrink:0;white-space:nowrap"
        >
          {{ relativeDate }}
        </span>
      </div>
      <div style="margin-top:6px;font-size:14px;line-height:1.55;color:var(--text-secondary)">
        {{ review.comment || "Aucun commentaire." }}
      </div>
      <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
        <button
          @click="emit('toggle-like', review)"
          :disabled="loadingLike"
          style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:transparent;border:1px solid var(--border);border-radius:999px;font-size:12px;color:var(--text-secondary);cursor:pointer"
        >
          <span :style="`color:${review.likedByMe ? 'var(--color-accent-primary)' : 'var(--text-secondary)'}`">♥</span>
          <span>{{ review.likesCount || 0 }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeDate } from "~/utils/formatRelativeDate";

const props = defineProps<{
  review: {
    id: number;
    rating: number;
    comment?: string | null;
    hasSpoilers?: boolean;
    createdAt?: string;
    likesCount?: number;
    likedByMe?: boolean;
    user?: {
      username?: string | null;
      avatar?: string | null;
    };
  };
  loadingLike?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-like", review: {
    id: number;
    likedByMe?: boolean;
    likesCount?: number;
  }): void;
}>();

const { resolve: resolveAvatarUrl } = useAvatarUrl();
const username = computed(() => props.review.user?.username || "Anonyme");
const initials = computed(() => (username.value || "?").slice(0, 2).toUpperCase());
const avatarSrc = computed(() => resolveAvatarUrl(props.review.user?.avatar));
const relativeDate = computed(() =>
  props.review.createdAt ? formatRelativeDate(props.review.createdAt) : "",
);
</script>
