<template>
  <!-- Game container -->
  <div ref="wrap" class="game-wrap">
    <!-- Render canvas -->
    <canvas ref="canvas" class="game-canvas"></canvas>

    <!-- UI overlay -->
    <div class="ui">
      <!-- Fullscreen button -->
      <n-button size="small" type="tertiary" circle @click="toggleFullscreen">
        <n-icon>
          <Fullscreen />
        </n-icon>
      </n-button>
    </div>

    <!-- ✅ NEU: Intro/Outro Overlay -->
    <div
      v-if="screen !== 'playing'"
      class="screen-overlay"
      @click="onOverlayClick">
      <img class="screen-image" :src="screenImage" alt="" />

      <div class="screen-actions" @click.stop>
        <n-button type="primary" size="large" @click="onOverlayClick">
          {{ screen === "intro" ? "Start" : "Nochmal" }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue imports
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Game from "@/features/game/core/Game.js";
import { Fullscreen } from "lucide-vue-next";

// DOM references
const wrap = ref(null);
const canvas = ref(null);
let game;

// ✅ NEU: UI screen state
// intro | playing | win | lose
const screen = ref("intro");

// ✅ NEU: overlay image url
const screenImage = computed(() => {
  if (screen.value === "intro")
    return "/images/9_intro_outro_screens/start/startscreen_1.png";
  if (screen.value === "win")
    return "/images/9_intro_outro_screens/You won, you lost/You Win A.png";
  return "/images/9_intro_outro_screens/You won, you lost/You lost.png";
});

// Toggle fullscreen
function toggleFullscreen() {
  const el = wrap.value;
  if (!document.fullscreenElement) el.requestFullscreen();
  else document.exitFullscreen();
}

// ✅ NEU: create game instance (and wire win/lose)
function createGame() {
  const c = canvas.value;
  c.width = 800;
  c.height = 450;

  game = new Game(c);

  // ✅ NEU: callbacks (Game muss die aufrufen)
  game.onWin = () => {
    screen.value = "win";
    game?.stop?.();
    console.log("[Game] WIN");
  };

  game.onLose = () => {
    screen.value = "lose";
    game?.stop?.();
    console.log("[Game] LOSE");
  };
}

// ✅ NEU: start/restart flow
function startGame() {
  screen.value = "playing";
  game?.start?.();
  console.log("[Game] start");
}

function restartGame() {
  game?.stop?.();
  createGame();
  startGame();
}

// ✅ NEU: click overlay to start / restart
function onOverlayClick() {
  if (screen.value === "intro") startGame();
  else restartGame();
}

// Mount lifecycle
onMounted(() => {
  createGame(); // ✅ NEU: init but DO NOT auto-start
  console.log("[Game] mounted (waiting on intro)");
});

// Cleanup lifecycle
onBeforeUnmount(() => {
  game?.stop?.();
  console.log("[Game] beforeUnmount");
});
</script>

<style scoped>
/* Wrapper styles */
.game-wrap {
  position: relative;
  width: 100%;
}

/* Canvas styles */
.game-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  background: var(--ds-card-bg);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
}

/* UI overlay */
.ui {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
}

/* ✅ NEU: screen overlay */
.screen-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  background: var(--ds-overlay);
  cursor: pointer;
  padding: 16px;
  border-radius: 8px;
}

.screen-image {
  /* max-width: min(92vw, 900px); */
  /* max-height: 80vh; */
  border-radius: 8px;
  display: block;
  width: 100%; 
  height: 100%;
}

.screen-actions {
  margin-top: 14px;
  position: absolute;
  bottom: 5%;
}

.screen-btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: 0;
}

/* Fullscreen wrapper */
.game-wrap:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
}

/* Fullscreen canvas */
.game-wrap:fullscreen .game-canvas {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: 0;
}
</style>
