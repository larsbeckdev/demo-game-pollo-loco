<template>
  <div class="hud" aria-hidden="true">
    <!-- LEFT: one card for 3 bars -->
    <div class="hud-left">
      <n-card
        class="hud-card"
        size="small"
        :bordered="false"
        content-style="padding: 0;">
        <div class="hud-bars">
          <img class="bar" :src="healthSrc" alt="" />
          <img class="bar" :src="coinSrc" alt="" />
          <img class="bar" :src="bottleSrc" alt="" />
        </div>
      </n-card>
    </div>

    <!-- RIGHT: boss card (optional) -->
    <div class="hud-right">
      <n-card
        v-if="showBoss"
        class="hud-card hud-card--boss"
        size="small"
        :bordered="false">
        <img class="bar boss" :src="bossSrc" alt="" />
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { NCard } from "naive-ui";
import {
  healthBarSrc,
  coinBarSrc,
  bottleBarSrc,
  bossBarSrc,
} from "./statusbar-utils.js";

const props = defineProps({
  stats: { type: Object, required: true },
  showBoss: { type: Boolean, default: false },
  color: { type: String, default: "orange" }, // "blue" | "green" | "orange"
});

const healthSrc = computed(() => healthBarSrc(props.stats.health, props.color));
const coinSrc = computed(() => coinBarSrc(props.stats.coins, props.color));
const bottleSrc = computed(() =>
  bottleBarSrc(props.stats.bottles, props.color),
);
const bossSrc = computed(() => bossBarSrc(props.stats.boss, props.color));
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* padding: 14px; */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hud-left,
.hud-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Card wrapper */
.hud-card {
  pointer-events: auto; /* enable interactions if you ever add buttons/tooltips */
  border-radius: 8px;
  backdrop-filter: blur(10px);
  background: transparent;
}

/* inner layout */
.hud-bars {
  display: flex;
  flex-direction: column;
  /* gap: 10px; */
}

/* optional: make boss card a bit tighter visually */
.hud-card--boss :deep(.n-card__content) {
  padding: 10px;
}

/* control padding for left card */
.hud-card :deep(.n-card__content) {
  padding: 10px;
}

.bar {
  width: 150px;
  height: auto;
  image-rendering: auto;
  display: block;
}

.boss {
  width: 260px;
}
</style>
