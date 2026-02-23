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
      <n-space :size="8">
        <!-- Settings button -->
        <n-button
          size="small"
          type="primary"
          secondary
          circle
          @click="openSettings">
          <n-icon>
            <Settings />
          </n-icon>
        </n-button>

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
      </n-space>
    </div>

    <!-- ✅ Intro/Outro Overlay -->
    <div v-if="screen !== 'playing'" class="screen-overlay">
      <div class="screen-stage">
        <img class="screen-image" :src="screenImage" alt="" />

        <div class="screen-actions" @click.stop>
          <!-- Intro: Start -->
          <template v-if="screen === 'intro'">
            <n-button
              class="start-button"
              secondary
              type="secondary"
              size="large"
              @click="startGame">
              Start
            </n-button>
          </template>

          <!-- Win / Lose: Restart + Exit -->
          <template v-else>
            <n-space vertical :size="12" align="center">
              <n-button
                class="start-button"
                secondary
                type="secondary"
                size="large"
                @click="restartGame">
                Nochmal
              </n-button>

              <n-button size="large" type="default" @click="exitToHome">
                Verlassen
              </n-button>
            </n-space>
          </template>
        </div>
      </div>
    </div>

    <!-- ✅ Settings Modal -->
    <n-modal
      v-model:show="showSettings"
      preset="card"
      title="Einstellungen"
      :style="{ width: '420px' }">
      <n-space vertical :size="14">
        <div>
          <div style="font-weight: 600; margin-bottom: 6px">Level</div>

          <n-select
            v-model:value="selectedLevel"
            :options="levelOptions"
            :disabled="screen === 'playing'" />

          <n-button
            style="margin-top: 10px"
            type="primary"
            secondary
            :disabled="screen === 'playing'"
            @click="applySelectedLevel">
            Level laden
          </n-button>

          <div style="opacity: 0.75; font-size: 12px; margin-top: 6px">
            (Levelwechsel ist deaktiviert während du spielst – erst im
            Intro/Endscreen.)
          </div>
        </div>

        <n-space justify="end" :size="8">
          <n-button @click="closeSettings"> Schließen </n-button>

          <!-- ✅ Restart & Exit NUR während des Spiels -->
          <template v-if="screen === 'playing'">
            <n-button type="warning" secondary @click="restartGame">
              Restart
            </n-button>

            <n-button type="error" @click="exitToHome"> Verlassen </n-button>
          </template>
        </n-space>
      </n-space>
    </n-modal>
  </div>
</template>

<script setup>
// Vue imports
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

// Game
import Game from "@/features/game/core/Game.js";

// UI
import { Fullscreen, Settings } from "lucide-vue-next";
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

const router = useRouter();

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
  Settings Modal
============================================================================ */

const showSettings = ref(false);

// Level selection (1-4)
const selectedLevel = ref(2); // default: Level 2

const levelOptions = [
  { label: "Level 1", value: 1 },
  { label: "Level 2", value: 2 },
  { label: "Level 3", value: 3 },
  { label: "Level 4", value: 4 },
];

function openSettings() {
  showSettings.value = true;
}

function closeSettings() {
  showSettings.value = false;
}

function applySelectedLevel() {
  // Block during gameplay
  if (screen.value === "playing") return;

  const idx = Math.max(0, Math.min(3, (selectedLevel.value ?? 1) - 1));

  if (typeof game?.loadLevel === "function") {
    game.loadLevel(idx);
    debugLog("[UI] Level loaded via game.loadLevel()", { idx });
  } else {
    debugLog("[UI] applySelectedLevel: game.loadLevel missing");
  }

  // stay in intro
  screen.value = "intro";
  syncHud();
  closeSettings();
}

/* ============================================================================
  Overlay Image Mapping
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
  Exit to Home
  - Stops game, clears HUD interval, navigates home
============================================================================ */

function exitToHome() {
  closeSettings();

  if (game?.__hudInterval) clearInterval(game.__hudInterval);
  stopGame();

  screen.value = "intro";

  // Try named route first, fallback to "/"
  router.push({ name: "home" }).catch(() => {
    router.push("/").catch(() => {});
  });

  debugLog("[UI] exitToHome()");
}

/* ============================================================================
  Game Setup
============================================================================ */

function createGame() {
  const c = canvas.value;
  if (!c) return;

  // Fixed internal resolution (CSS skaliert responsiv)
  c.width = 800;
  c.height = 450;

  game = new Game(c);

  // Keep selected level in sync if Game supports it
  // If your Game constructor currently starts at level1 by default,
  // you can call loadLevel here.
  if (typeof game?.loadLevel === "function") {
    const idx = Math.max(0, Math.min(3, (selectedLevel.value ?? 1) - 1));
    game.loadLevel(idx);
  }

  // HUD sync interval (simple + stable)
  game.__hudInterval = setInterval(syncHud, 100);

  // Win/Lose Callbacks
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

  // ✅ allow world to run (important because World.update freezes otherwise)
  if (game?.gameWorld) game.gameWorld.state = "playing";

  game?.start?.();
  debugLog("[UI] startGame()");
}

function stopGame() {
  game?.stop?.();
  debugLog("[UI] stopGame()");
}

function restartGame() {
  closeSettings();

  // cleanup old
  if (game?.__hudInterval) clearInterval(game.__hudInterval);
  stopGame();

  // rebuild fresh instance
  createGame();
  startGame();

  debugLog("[UI] restartGame()");
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
  object-fit: cover;
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
