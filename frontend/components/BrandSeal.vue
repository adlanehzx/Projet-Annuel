<template>
  <span :style="wrapperStyle" aria-hidden="true">
    <img
      :src="src"
      :alt="alt"
      :style="imgStyle"
      :loading="loading"
      decoding="async"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import roundSvg from "~/assets/images/hankotrack-maneki-neko-round.svg";
import roundPng from "~/assets/images/hankotrack-maneki-neko-round.png";

const props = withDefaults(
  defineProps<{
    size?: number | string;
    format?: "svg" | "png";
    alt?: string;
    loading?: "lazy" | "eager";
  }>(),
  {
    size: 30,
    format: "svg",
    alt: "Sceau HankoTrack",
    loading: "eager",
  },
);

const pxSize = computed(() => (typeof props.size === "number" ? `${props.size}px` : props.size));

const src = computed(() => (props.format === "png" ? roundPng : roundSvg));

const wrapperStyle = computed(() =>
  [
    "display:inline-grid;place-items:center;line-height:0;",
    `width:${pxSize.value};height:${pxSize.value};`,
  ].join(""),
);

const imgStyle = computed(() => "width:100%;height:100%;object-fit:contain;display:block");
</script>
