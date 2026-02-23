<template>
  <!-- Game container -->
  <div ref="wrap" class="game-wrap">
    <!-- Render canvas -->
    <canvas ref="canvas" class="game-canvas"></canvas>

    <!-- ✅ HUD (Statusbars) nur im Spiel -->
    <GameHud
      v-if="screen === 'playing'"
      class="hud-layer"
      :stats="hudStats"
      :showBoss="hudStats.boss < 100"
      color="orange" />

    <!-- UI overlay (Buttons oben rechts) -->
    <div class="ui">
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

    <!-- ✅ Intro/Outro Overlay -->
    <div v-if="screen !== 'playing'" class="screen-overlay">
      <div class="screen-stage">
        <img class="screen-image" :src="screenImage" alt="" />

        <!-- Button-Layer über dem Bild -->
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

// Game
import Game from "@/features/game/core/Game.js";

// UI
import { Fullscreen } from "lucide-vue-next";
import GameHud from "@/features/game/ui/hud/GameHud.vue";

/* ============================================================================
  DEBUG (Abgabe: auf false lassen)
  - Wenn DEBUG true ist, bekommst du Logs (nicht checklist-konform).
============================================================================ */

const DEBUG = false;

function debugLog(...args) {
  if (!DEBUG) return;
  console.log(...args);
}

/* ============================================================================
  DOM refs
============================================================================ */

const wrap = ref(null);
const canvas = ref(null);
let game = null;

/* ============================================================================
  Screen State
  - intro | playing | win | lose
============================================================================ */

const screen = ref("intro");

/* ============================================================================
  HUD Stats (Statusbars)
  - Werte werden aus world.stats synchronisiert
============================================================================ */

const hudStats = ref({
  health: 100,
  coins: 0,
  bottles: 100,
  boss: 100,
});

function syncHud() {
  const stats = game?.gameWorld?.stats;
  if (!stats) return;

  hudStats.value = {
    health: stats.health ?? 100,
    coins: stats.coins ?? 0,
    bottles: stats.bottles ?? 100,
    boss: stats.boss ?? 100,
  };
}

/* ============================================================================
  Overlay Image Mapping
  - Passe die Pfade an deine echten Dateien an
============================================================================ */

const screenImage = computed(() => {
  if (screen.value === "intro")
    return "/images/9_intro_outro_screens/start/startscreen_1.png";

  if (screen.value === "win")
    return "/images/9_intro_outro_screens/You won, you lost/You Win A.png";

  // lose
  return "/images/9_intro_outro_screens/You won, you lost/You lost.png";
});

/* ============================================================================
  Fullscreen
============================================================================ */

function toggleFullscreen() {
  const el = wrap.value;
  if (!el) return;

  if (!document.fullscreenElement) el.requestFullscreen();
  else document.exitFullscreen();
}

/* ============================================================================
  Game Setup
  - Erstellt Game Instanz
  - HUD Sync Timer
  - Win/Lose Callbacks
============================================================================ */

function createGame() {
  const c = canvas.value;
  if (!c) return;

  // Fixed internal resolution (CSS skaliert responsiv)
  c.width = 800;
  c.height = 450;

  game = new Game(c);

  // HUD sync interval (simple + stable)
  game.__hudInterval = setInterval(syncHud, 100);

  // Callbacks (WICHTIG: Game.js muss diese auch wirklich aufrufen!)
  // => In Game.update() muss sowas passieren:
  //    if (world.state === "won") this.onWin?.();
  //    if (world.state === "lost") this.onLose?.();
  game.onWin = () => {
    screen.value = "win";
    game?.stop?.();
    debugLog("[UI] WIN -> screen=win");
  };

  game.onLose = () => {
    screen.value = "lose";
    game?.stop?.();
    debugLog("[UI] LOSE -> screen=lose");
  };

  // Initial HUD pull
  syncHud();

  debugLog("[UI] createGame()", { canvas: { w: c.width, h: c.height } });
}

/* ============================================================================
  Start / Restart Flow (ohne Reload)
============================================================================ */

function startGame() {
  screen.value = "playing";

  // ✅ allow world to run
  if (game?.gameWorld) game.gameWorld.state = "playing";

  game?.start?.();
  debugLog("[UI] startGame()");
}

function stopGame() {
  game?.stop?.();
  debugLog("[UI] stopGame()");
}

function restartGame() {
  // cleanup old
  if (game?.__hudInterval) clearInterval(game.__hudInterval);
  stopGame();

  // rebuild fresh instance
  createGame();
  startGame();

  debugLog("[UI] restartGame()");
}

function onOverlayClick() {
  if (screen.value === "intro") startGame();
  else restartGame();
}

/* ============================================================================
  Lifecycle
============================================================================ */

onMounted(() => {
  createGame(); // init but DO NOT auto-start
  debugLog("[UI] mounted -> waiting on intro");
});

onBeforeUnmount(() => {
  stopGame();
  if (game?.__hudInterval) clearInterval(game.__hudInterval);
  debugLog("[UI] beforeUnmount -> cleaned up");
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

  /* Tipp: Wenn dein Background sowieso alles zeichnet, lieber transparent */
  background: var(--ds-card-bg);

  border: 1px solid var(--ds-border);
  border-radius: 8px;
}

/* HUD layer (oben links) */
.hud-layer {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 40;
  pointer-events: none;
}

/* UI overlay (Buttons oben rechts) */
.ui {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
}

/* Screen overlay */
.screen-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ds-overlay);
}

/* Stage is relative container for image + actions */
.screen-stage {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Image fills stage */
.screen-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* alternativ: contain */
  display: block;
}

/* Button overlay */
.screen-actions {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.start-button {
  padding: 12px 36px;
  font-size: 1.25rem;
  color: #fff;
}

.start-button:hover {
  color: #fff;
}

/* Optional: readability layer */
.screen-actions::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--ds-overlay);
  pointer-events: none;
}

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
