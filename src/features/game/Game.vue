<!-- Game.vue -->
<template>
  <!-- Game container -->
  <div ref="wrap" class="game-wrap">
    <!-- Render canvas -->
    <canvas ref="canvas" class="game-canvas"></canvas>

    <!-- ✅ Rotate Overlay (nur mobile/touch + portrait) -->
    <div v-if="showRotateOverlay" class="rotate-overlay">
      <div class="rotate-card">
        <div class="rotate-title">
          Bitte drehe dein Gerät und aktiviere den Vollbildmodus
        </div>
        <div class="rotate-sub">
          Dieses Spiel funktioniert nur im Querformat.
        </div>
      </div>
    </div>

    <!-- ✅ HUD (Statusbars) nur im Spiel -->
    <GameHud
      v-if="screen === 'playing'"
      class="hud-layer"
      :stats="hudStats"
      :showBoss="hudStats.boss < 100"
      color="orange" />

    <!-- UI overlay (Buttons oben rechts) -->
    <!-- UI overlay (Buttons oben rechts) -->
    <div class="ui">
      <n-space :size="8" align="center">
        <n-tag size="small" round type="info"> Level {{ activeLevel }} </n-tag>

        <!-- ✅ Mute -->
        <n-button
          size="small"
          type="primary"
          secondary
          circle
          :title="isMuted ? 'Sound an' : 'Sound aus'"
          @click="
            (e) => {
              e?.currentTarget?.blur?.();
              toggleMute();
            }
          ">
          <n-icon>
            <VolumeX v-if="isMuted" />
            <Volume2 v-else />
          </n-icon>
        </n-button>

        <!-- Settings -->
        <n-button
          size="small"
          type="primary"
          secondary
          circle
          @click="
            (e) => {
              e?.currentTarget?.blur?.();
              openSettings();
            }
          ">
          <n-icon><Settings /></n-icon>
        </n-button>

        <!-- Fullscreen -->
        <n-button
          size="small"
          type="primary"
          secondary
          circle
          @click="
            (e) => {
              e?.currentTarget?.blur?.();
              toggleFullscreen();
            }
          ">
          <n-icon><Fullscreen /></n-icon>
        </n-button>
      </n-space>
    </div>

    <!-- ✅ Touch Controls (nur mobile/touch) -->
    <div v-if="showTouch && screen === 'playing'" class="touch">
      <div class="touch-left">
        <button
          class="touch-btn"
          @pointerdown.prevent="touchDown('LEFT')"
          @pointerup.prevent="touchUp('LEFT')"
          @pointercancel.prevent="touchUp('LEFT')"
          @pointerleave.prevent="touchUp('LEFT')">
          <ChevronLeft :size="26" />
        </button>

        <button
          class="touch-btn"
          @pointerdown.prevent="touchDown('RIGHT')"
          @pointerup.prevent="touchUp('RIGHT')"
          @pointercancel.prevent="touchUp('RIGHT')"
          @pointerleave.prevent="touchUp('RIGHT')">
          <ChevronRight :size="26" />
        </button>
      </div>

      <div class="touch-right">
        <button
          class="touch-btn touch-btn--big"
          @pointerdown.prevent="touchTap('JUMP')">
          <ArrowUp :size="28" />
        </button>

        <button
          class="touch-btn touch-btn--big"
          @pointerdown.prevent="touchTap('THROW')">
          <BottleWine :size="28" />
        </button>
      </div>
    </div>

    <!-- ✅ Intro/Outro Overlay -->
    <div v-if="screen !== 'playing'" class="screen-overlay">
      <div class="screen-stage">
        <img
          class="screen-image"
          :src="screenImage"
          alt=""
          @error="
            (e) => console.warn('[screenImage] failed:', screenImage, e)
          " />

        <div class="screen-actions" @click.stop="() => {}">
          <!-- Intro: Start -->
          <template v-if="screen === 'intro'">
            <n-button
              class="start-button"
              secondary
              type="secondary"
              size="large"
              @click="
                (e) => {
                  e?.currentTarget?.blur?.();
                  startGame();
                }
              ">
              Start
            </n-button>
          </template>

          <!-- Win / Lose -->
          <template v-else>
            <n-space vertical :size="12" align="center">
              <!-- Only on WIN and not final: next level button -->
              <n-button
                v-if="screen === 'win' && !winIsFinal"
                class="start-button"
                type="primary"
                size="large"
                @click="
                  (e) => {
                    e?.currentTarget?.blur?.();
                    nextLevel();
                  }
                ">
                Nächstes Level
              </n-button>

              <!-- Final win label (Level 4) -->
              <div
                v-if="screen === 'win' && winIsFinal"
                style="
                  font-weight: 700;
                  font-size: 20px;
                  color: white;
                  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
                "></div>

              <!-- Always available on end screens -->
              <n-button
                class="restart-button"
                secondary
                type="secondary"
                size="large"
                @click="
                  (e) => {
                    e?.currentTarget?.blur?.();
                    restartGame();
                  }
                ">
                Nochmal
              </n-button>

              <n-button
                class="exit-button"
                size="small"
                secondary
                type="secondary"
                @click="
                  (e) => {
                    e?.currentTarget?.blur?.();
                    exitToHome();
                  }
                ">
                Verlassen
              </n-button>
            </n-space>
          </template>
        </div>
      </div>
    </div>

    <!-- ✅ Settings Modal (Fullscreen-safe via :to="wrap") -->
    <n-modal
      :show="showSettings"
      preset="card"
      title="Einstellungen"
      closable
      :mask-closable="true"
      :close-on-esc="true"
      :to="wrap"
      :style="{ width: '420px' }"
      @update:show="handleSettingsShowUpdate"
      @close="handleSettingsClose">
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
          <!-- ✅ CHANGE: normaler Close-Button bleibt "mit Resume" -->
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
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onActivated,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import Game from "@/features/game/core/Game.js";
import {
  Fullscreen,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  BottleWine,
  Volume2,
  VolumeX,
} from "lucide-vue-next";
import GameHud from "@/features/game/ui/hud/GameHud.vue";

const DEBUG = false;
function debugLog(...args) {
  if (!DEBUG) return;
  console.log(...args);
}

const router = useRouter();
const wrap = ref(null);
const canvas = ref(null);
let game = null;

/* ============================================================================
  Mute (robust)
============================================================================ */

const isMuted = ref(localStorage.getItem("game_muted") === "true");

// merkt sich vorherige Lautstärke pro Element
function setGlobalMediaMuted(muted) {
  const els = Array.from(document.querySelectorAll("audio, video"));

  for (const el of els) {
    if (!el) continue;

    // volume merken (nur wenn nicht schon gemerkt)
    if (el.dataset && el.dataset.prevVol == null) {
      el.dataset.prevVol = String(el.volume ?? 1);
    }

    el.muted = muted;

    // manche Browser ignorieren muted bei bestimmten Setups -> Volume als Backup
    if (muted) {
      el.volume = 0;
      el.pause?.(); // optional: stoppt direkt
    } else {
      const prev = el.dataset?.prevVol;
      el.volume = prev != null ? Number(prev) : 1;
    }
  }
}

function hookSoundSystem() {
  const sound = game?.gameWorld?.sound;
  if (!sound || sound.__muteHooked) return;

  sound.__muteHooked = true;

  // falls es sounds als Map/Object gibt: sofort muten
  if (sound.sounds && typeof sound.sounds === "object") {
    for (const a of Object.values(sound.sounds)) {
      if (a && "muted" in a) a.muted = isMuted.value;
      if (a && "volume" in a) a.volume = isMuted.value ? 0 : (a.volume ?? 1);
    }
  }

  // Hook: jedes play setzt danach den Mute-Zustand (für lazy-created audio)
  if (typeof sound.play === "function") {
    const origPlay = sound.play.bind(sound);
    sound.play = (...args) => {
      const res = origPlay(...args);
      // nach play erneut anwenden, damit neue Audio-Instanzen direkt gemutet sind
      applyMuteToGame();
      return res;
    };
  }
}

function applyMuteToGame() {
  const sound = game?.gameWorld?.sound;
  if (!sound) return;

  if (typeof sound.setMuted === "function") {
    sound.setMuted(isMuted.value);
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value;
  localStorage.setItem("game_muted", String(isMuted.value));
  applyMuteToGame();
}

// wenn sich isMuted ändert (z.B. initial), sofort anwenden
watch(isMuted, () => applyMuteToGame(), { immediate: true });

/* ============================================================================
  MObile touch controls
============================================================================ */

const showTouch = ref(false);

function detectTouch() {
  showTouch.value = "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

const isPortrait = ref(false);

function updateOrientation() {
  // sicherste Variante: viewport vergleichen
  isPortrait.value = window.innerHeight > window.innerWidth;
}

const showRotateOverlay = computed(() => {
  // nur auf Touch-Geräten zeigen + nur im Portrait
  return showTouch.value && isPortrait.value;
});

function setKey(action, value) {
  ensureGame();
  const kb = game?.keyboardInput;
  if (!kb) return;

  switch (action) {
    case "LEFT":
      kb.A = value;
      break;
    case "RIGHT":
      kb.D = value;
      break;
    case "JUMP":
      kb.SPACE = value;
      break;
    case "THROW":
      kb.ENTER = value;
      break;
    case "INTERACT":
      kb.E = value;
      break;
  }
}

function touchDown(flag) {
  if (screen.value !== "playing") return;
  setKey(flag, true);
}

function touchUp(flag) {
  setKey(flag, false);
}

function touchTap(flag) {
  if (screen.value !== "playing") return;

  // kurzer Impuls (damit justPressed im ThrowSystem funktioniert)
  setKey(flag, true);
  setTimeout(() => setKey(flag, false), 40);
}

/* ============================================================================
  Screen State
============================================================================ */
const screen = ref("intro"); // intro | playing | win | lose

/* ============================================================================
  Win info + Level label
============================================================================ */
const winIsFinal = ref(false);
const activeLevel = ref(1);

/* ============================================================================
  HUD Stats
============================================================================ */
const hudStats = ref({
  health: 100,
  coins: 0,
  bottles: 100,
  boss: 100,
});

function syncLevelLabel() {
  if (!game) return;
  if (typeof game.getLevelNumber === "function")
    activeLevel.value = game.getLevelNumber();
  else activeLevel.value = (game.levelIndex ?? 0) + 1;

  if (DEBUG) {
    console.log(
      "%c[UI] ACTIVE LEVEL",
      "color:gold;font-weight:bold;",
      activeLevel.value,
    );
  }
}

function syncHud() {
  const stats = game?.gameWorld?.stats;
  if (!stats) {
    if (DEBUG)
      console.warn("[HUD] no stats at game.gameWorld.stats", game?.gameWorld); // ✅ CHANGE
    return;
  }

  if (DEBUG) {
    // ✅ CHANGE
    console.log("[HUD] read stats", {
      health: stats.health,
      coins: stats.coins,
      bottles: stats.bottles,
      boss: stats.boss,
    });
  }

  hudStats.value = {
    health: stats.health ?? 100,
    coins: stats.coins ?? 0,
    bottles: stats.bottles ?? 100,
    boss: stats.boss ?? 100,
  };

  syncLevelLabel();
}

/* ============================================================================
  Settings Modal
============================================================================ */
const showSettings = ref(false);
const selectedLevel = ref(1);

const levelOptions = [
  { label: "Level 1", value: 1 },
  { label: "Level 2", value: 2 },
  { label: "Level 3", value: 3 },
  { label: "Level 4", value: 4 },
];

function openSettings() {
  setSettingsOpen(true);
}

function closeSettings() {
  setSettingsOpen(false);
}

function setSettingsOpen(nextOpen) {
  // nichts tun, wenn sich nichts ändert
  if (showSettings.value === nextOpen) return;

  // Öffnen
  if (nextOpen) {
    pauseGameForSettings();
    showSettings.value = true;
    return;
  }

  // Schließen
  showSettings.value = false;
  resumeGameFromSettings();
}

function handleSettingsShowUpdate(value) {
  setSettingsOpen(value);
}

function handleSettingsClose() {
  setSettingsOpen(false);
}

/* ✅ CHANGE: "silent close" ohne Resume (für Restart/Exit/Next) */
function closeSettingsSilent() {
  // ✅ CHANGE
  showSettings.value = false; // ✅ CHANGE
} // ✅ CHANGE

function applySelectedLevel() {
  if (screen.value === "playing") return;

  const idx = Math.max(0, Math.min(3, (selectedLevel.value ?? 1) - 1));

  ensureGame();
  if (typeof game?.loadLevel === "function") {
    game.loadLevel(idx);
    debugLog("[UI] Level loaded via game.loadLevel()", { idx });
  }

  winIsFinal.value = false;
  screen.value = "intro";

  syncHud();
  closeSettings();
}

/* ============================================================================
  Overlay Images
============================================================================ */
const screenImage = computed(() => {
  const base = import.meta.env.BASE_URL;

  const folder = "images/You_won_you_lost";
  const intro = `${base}images/9_intro_outro_screens/start/startscreen_1.png`;
  const winNormal = `${base}${folder}/YouWinA.png`;
  const winFinal = `${base}${folder}/YouwonA.png`;
  const lose = `${base}${folder}/YouLost.png`;

  let raw = intro;
  if (screen.value === "win") raw = winIsFinal.value ? winFinal : winNormal;
  if (screen.value === "lose") raw = lose;

  return encodeURI(raw);
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
  Cleanup
============================================================================ */
function destroyGame() {
  try {
    game?.stop?.();
  } catch {}

  if (game?.__hudInterval) {
    clearInterval(game.__hudInterval);
    game.__hudInterval = null;
  }

  game = null;
}

/* ============================================================================
  Ensure game exists
============================================================================ */
function ensureGame() {
  if (game) return;

  const c = canvas.value;
  if (!c) return;

  c.width = 800;
  c.height = 450;

  game = new Game(c);

  hookSoundSystem();
  applyMuteToGame();

  // selectedLevel -> initial load
  if (typeof game?.loadLevel === "function") {
    const idx = Math.max(0, Math.min(3, (selectedLevel.value ?? 1) - 1));
    game.loadLevel(idx);
  }

  game.__hudInterval = setInterval(syncHud, 100);

  // ✅ onWin: Game.js lädt ggf. schon next level, wir zeigen nur Screen
  game.onWin = ({ isFinal } = {}) => {
    winIsFinal.value = !!isFinal;
    screen.value = "win";
    syncLevelLabel(); // nach auto-load stimmt das Label sofort
    debugLog("[UI] WIN", { isFinal, activeLevel: activeLevel.value });
  };

  game.onLose = () => {
    winIsFinal.value = false;
    screen.value = "lose";
    debugLog("[UI] LOSE");
  };

  syncHud();
  syncLevelLabel();
  debugLog("[UI] ensureGame() created");
}

/* ============================================================================
  Start / Restart / Next
============================================================================ */
function startGame() {
  ensureGame();

  game?.gameWorld?.sound?.play?.("gameStart");
  winIsFinal.value = false;
  screen.value = "playing";

  if (game?.gameWorld) game.gameWorld.state = "playing";

  syncLevelLabel();
  game?.start?.();

  debugLog("[UI] startGame()", { level: activeLevel.value });
}

function restartGame() {
  // ✅ CHANGE: NICHT closeSettings() (würde resume starten), sondern silent
  closeSettingsSilent(); // ✅ CHANGE

  destroyGame();
  ensureGame();

  winIsFinal.value = false;
  screen.value = "playing";

  if (game?.gameWorld) game.gameWorld.state = "playing";

  syncLevelLabel();
  game?.start?.();

  debugLog("[UI] restartGame()", { level: activeLevel.value });
}

/* ✅ Button soll NUR starten (Level ist bereits geladen durch Game.js) */
function nextLevel() {
  // ✅ CHANGE: NICHT closeSettings() (würde resume starten), sondern silent
  closeSettingsSilent(); // ✅ CHANGE

  // game exists, next level is already loaded
  winIsFinal.value = false;
  screen.value = "playing";

  if (game?.gameWorld) game.gameWorld.state = "playing";

  syncLevelLabel();
  game?.start?.();

  debugLog("[UI] nextLevel() START", { level: activeLevel.value });
}

/* ============================================================================
  Pause / Resume (Settings)
============================================================================ */

function pauseGameForSettings() {
  // nur pausieren, wenn gerade gespielt wird
  if (screen.value !== "playing") return;
  if (!game?.gameWorld) return;

  game.gameWorld.state = "paused";
  game.stop?.(); // loop stoppen (spart CPU, keine Inputs)
  debugLog("[UI] PAUSE (settings)");
}

function resumeGameFromSettings() {
  // nur fortsetzen, wenn wir im playing screen sind
  if (screen.value !== "playing") return;
  if (!game?.gameWorld) return;

  game.gameWorld.state = "playing";
  game.start?.(); // loop wieder an
  debugLog("[UI] RESUME (settings)");
}

/* ============================================================================
  Exit to Home
============================================================================ */
async function exitToHome() {
  // ✅ CHANGE: NICHT closeSettings() (würde resume starten), sondern silent
  closeSettingsSilent(); // ✅ CHANGE

  destroyGame();
  winIsFinal.value = false;
  screen.value = "intro";

  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch {}
  }

  try {
    await router.push({ name: "home" });
  } catch {
    await router.push("/").catch(() => {});
  }

  debugLog("[UI] exitToHome()");
}

/* ============================================================================
  Lifecycle
============================================================================ */
onMounted(() => {
  ensureGame();

  detectTouch();
  updateOrientation();

  const onResize = () => {
    detectTouch();
    updateOrientation();
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  debugLog("[UI] mounted -> waiting on intro");
});

onActivated(() => {
  ensureGame();
  debugLog("[UI] activated -> ensureGame()");
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", detectTouch);

  destroyGame();
  debugLog("[UI] beforeUnmount -> cleaned up");
});
</script>

<style scoped>
.game-wrap {
  position: relative;
  width: 100%;
}

.game-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  background: var(--ds-card-bg);
  /* border: 1px solid var(--ds-border); */
  border-radius: 8px;
}

.hud-layer {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 40;
  pointer-events: none;
}

.ui {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
}

.screen-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ds-overlay);
}

.screen-stage {
  position: relative;
  width: 100%;
  height: 100%;
}

.screen-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.screen-actions {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.start-button,
.again-button,
.next-button,
.exit-button,
.restart-button {
  padding: 12px 36px;
  color: #fff;
}

.start-button:hover,
.again-button:hover,
.next-button:hover,
.exit-button:hover,
.restart-button:hover {
  color: #fff;
}

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

.game-wrap:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;
}

.game-wrap:fullscreen .game-canvas {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: 0;
}

/* touch  */
.touch-btn svg {
  stroke-width: 2.5;
}

.touch-btn--big svg {
  stroke-width: 2.8;
}

.touch {
  position: absolute;
  inset: 0;
  z-index: 60;
  pointer-events: none;
}

.touch-left,
.touch-right {
  position: absolute;
  bottom: 14px;
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

.touch-left {
  left: 14px;
}

.touch-right {
  right: 14px;
}

.touch-btn {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  backdrop-filter: blur(12px);
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.touch-btn--big {
  width: 64px;
  height: 64px;
}

/* turn device  */
.rotate-overlay {
  position: absolute;
  inset: 0;
  z-index: 999;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 16px;
}

.rotate-card {
  width: 90%;
  padding: 18px 16px;
  border-radius: 16px;
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
  color: #fff;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.rotate-title {
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 0.2px;
}

.rotate-sub {
  margin-top: 8px;
  opacity: 0.85;
  font-size: 13px;
}

/* screenimage  */
.screen-image {
  position: absolute;
  /* top: 50%; */
  /* left: 50%; */
  width: 100%;
  height: 100%;
  /* transform: translate(-50%, -50%); */
  object-fit: contain;
}
</style>
