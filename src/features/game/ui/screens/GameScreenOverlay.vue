<template>
  <div v-if="screen !== 'playing'" class="overlay">
    <img class="bg" :src="imageSrc" alt="" />

    <div class="actions" @click.stop>
      <button class="btn" type="button" @click="$emit('primary')">
        {{ primaryLabel }}
      </button>

      <button
        v-if="showSecondary"
        class="btn secondary"
        type="button"
        @click="$emit('secondary')">
        {{ secondaryLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  screen: { type: String, required: true }, // "intro" | "playing" | "won" | "lost"
});

defineEmits(["primary", "secondary"]);

const imageSrc = computed(() => {
  if (props.screen === "intro")
    return "/images/9_intro_outro_screens/start/start.png"; // <- falls du eins hast
  if (props.screen === "won")
    return "/images/9_intro_outro_screens/You won, you lost/You Won.png";
  if (props.screen === "lost")
    return "/images/9_intro_outro_screens/game_over/game over!.png";
  return "";
});

const primaryLabel = computed(() => {
  if (props.screen === "intro") return "Start";
  return "Nochmal";
});

const showSecondary = computed(
  () => props.screen === "won" || props.screen === "lost",
);
const secondaryLabel = computed(() => "Zurück");
</script>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.6);
}

.bg {
  max-width: min(860px, 92vw);
  max-height: min(520px, 70vh);
  width: auto;
  height: auto;
  border-radius: 18px;
}

.actions {
  position: absolute;
  bottom: 24px;
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

.btn {
  cursor: pointer;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
}

.secondary {
  opacity: 0.85;
}
</style>
