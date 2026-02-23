<template>
  <!-- Game container -->
  <div ref="wrap" class="game-wrap">
    <!-- Render canvas -->
    <canvas ref="canvas" class="game-canvas"></canvas>

    <!-- UI overlay -->
    <div class="ui">
      <!-- ✅ HUD (Statusbars) nur im Spiel -->
      <GameHud
        v-if="screen === 'playing'"
        :stats="hudStats"
        :showBoss="hudStats.boss < 100"
        color="orange" />
      <!-- Fullscreen button -->
      <n-button
        size="small"
        type="primary"
        secondary
        circle
        @click="toggleFullscreen">
        <n-icon>
          <Fullscreen />
        </n-icon>
      </n-button>
    </div>

    <!-- ✅ NEU: Intro/Outro Overlay -->
    <div v-if="screen !== 'playing'" class="screen-overlay">
      <div class="screen-stage">
        <img class="screen-image" :src="screenImage" alt="" />

        <!-- ✅ Button-Layer über dem Bild -->
        <div class="screen-actions" @click.stop>
          <n-button
            class="start-button"
            secondary
            type="secondary"
            size="large"
            @click="onOverlayClick">
            {{ screen === "intro" ? "Start" : "Nochmal" }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue imports
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Game from "@/features/game/core/Game.js";
import { Fullscreen } from "lucide-vue-next";
import GameHud from "@/features/game/ui/hud/GameHud.vue";

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

/* ✅ Screen overlay (liegt über Canvas) */
.screen-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  border-radius: 8px;
  overflow: hidden; /* wichtig damit Bild + Button nicht rauslaufen */
  background: var(--ds-overlay);
}

/* ✅ Stage ist der relative Container fürs Bild */
.screen-stage {
  position: relative;
  width: 100%;
  height: 100%;
}

/* ✅ Bild füllt Stage */
.screen-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* oder: contain (siehe unten) */
  display: block;
}

/* ✅ Button liegt über dem Bild */
.screen-actions {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center; /* unten mittig */
  /* padding: 18px; */
}

.start-button {
  padding: 12px 36px;
  font-size: 1.25rem;
  color: #fff;
}

.start-button:hover {
  color: #fff;
}

.start-button .n-button__content .n-button__border {
}

/* ✅ Optional: Lesbarkeit unten verbessern */
.screen-actions::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  background: var(--ds-overlay);
  pointer-events: none;
}

/* Button muss über dem Gradient liegen */
.screen-actions > * {
  position: relative;
  z-index: 1;
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
