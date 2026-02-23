<template>
  <div class="hud" aria-hidden="true">
    <div class="hud-left">
      <img class="bar" :src="healthSrc" alt="" />
      <img class="bar" :src="coinSrc" alt="" />
      <img class="bar" :src="bottleSrc" alt="" />
    </div>

    <div class="hud-right">
      <img v-if="showBoss" class="bar boss" :src="bossSrc" alt="" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
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
  padding: 14px;
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

.bar {
  width: 220px;
  height: auto;
  image-rendering: auto;
}

.boss {
  width: 260px;
}
</style>
