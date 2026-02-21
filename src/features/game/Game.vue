<template>
  <!-- Game container -->
  <div ref="wrap" class="game-wrap">
    <!-- Render canvas -->
    <canvas ref="canvas" class="game-canvas"></canvas>

    <!-- UI overlay -->
    <div class="ui">
      <!-- Fullscreen button -->
      <n-button
        size="small"
        type="tertiary"
        circle
        @click="toggleFullscreen"
        aria-label="Fullscreen umschalten">
        <n-icon :size="18">
          <Fullscreen />
        </n-icon>
      </n-button>
    </div>
  </div>
</template>

<script setup>
// ============================================================================
// Imports
// ============================================================================

// Vue lifecycle
import { ref, onMounted, onBeforeUnmount } from "vue";

// Game class
import Game from "@/features/game/Game.js";

// Icon
import { Fullscreen } from "lucide-vue-next";

// ============================================================================
// Refs / State
// ============================================================================

const wrap = ref(null); // Wrapper ref
const canvas = ref(null); // Canvas ref
let game = null; // Game instance

// Keep a stable 16:9 base resolution (recommended for pixel-perfect rendering)
const BASE_WIDTH = 800;
const BASE_HEIGHT = 450;

// ============================================================================
// Helpers: Canvas sizing (no blur, responsive)
// ============================================================================

/**
 * Set canvas internal pixel size based on element size and devicePixelRatio.
 * This keeps rendering sharp (important for sprites).
 * @param {HTMLCanvasElement} canvasEl - Canvas
 */
function resizeCanvasToElement(canvasEl) {
  const rect = canvasEl.getBoundingClientRect();

  // Guard: avoid zero sizes (rare, but can happen during layout)
  if (rect.width <= 0 || rect.height <= 0) return;

  // Match device pixel ratio for sharp rendering
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const nextWidth = Math.round(rect.width * dpr);
  const nextHeight = Math.round(rect.height * dpr);

  // Only write if size actually changed (prevents flicker & extra work)
  if (canvasEl.width !== nextWidth) canvasEl.width = nextWidth;
  if (canvasEl.height !== nextHeight) canvasEl.height = nextHeight;
}

/**
 * Apply CSS aspect ratio + max width behavior, while keeping a sane base size.
 * - CSS controls layout size (responsive).
 * - Canvas internal size is set via resizeCanvasToElement for sharpness.
 */
function setupInitialCanvasSize() {
  const c = canvas.value;
  if (!c) return;

  // Set a predictable initial internal size (fallback)
  c.width = BASE_WIDTH;
  c.height = BASE_HEIGHT;

  // Then immediately adapt to actual rendered size
  resizeCanvasToElement(c);
}

// ============================================================================
// Fullscreen
// ============================================================================

async function toggleFullscreen() {
  const el = wrap.value;
  if (!el) return;

  // Enter fullscreen
  if (!document.fullscreenElement) {
    await el.requestFullscreen();
    return;
  }

  // Exit fullscreen
  await document.exitFullscreen();
}

// ============================================================================
// Lifecycle
// ============================================================================

function onResize() {
  const c = canvas.value;
  if (!c) return;

  resizeCanvasToElement(c);
}

function onFullscreenChange() {
  // Fullscreen changes layout -> recalc canvas internal resolution
  onResize();
}

onMounted(() => {
  // Setup canvas size
  setupInitialCanvasSize();

  // Create & start game
  const c = canvas.value;
  game = new Game(c);
  game.start();

  // Listen to resize + fullscreen changes
  window.addEventListener("resize", onResize);
  document.addEventListener("fullscreenchange", onFullscreenChange);

  // Safety: trigger one more resize after initial layout
  queueMicrotask(() => onResize());
});

onBeforeUnmount(() => {
  // Stop game loop
  game?.stop();
  game = null;

  // Cleanup listeners
  window.removeEventListener("resize", onResize);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
});
</script>

<style scoped>
/* ============================================================================
  Layout wrapper
============================================================================ */

.game-wrap {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;

  /* Prevent scrollbars caused by fullscreen sizing on some browsers */
  overflow: hidden;
}

/* ============================================================================
  Canvas
  - CSS controls responsive sizing
  - JS sets internal pixel resolution for sharp rendering
============================================================================ */

.game-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;

  background: var(--ds-card-bg);
  border: 1px solid var(--ds-border);
  border-radius: 8px;
}

/* ============================================================================
  UI overlay
============================================================================ */

.ui {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

/* Ensure all buttons show pointer cursor (checklist) */
.ui :deep(button),
.ui :deep(.n-button) {
  cursor: pointer;
}

/* ============================================================================
  Fullscreen
============================================================================ */

.game-wrap:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  margin: 0;

  /* Prevent browser UI margins */
  background: #000;
}

.game-wrap:fullscreen .game-canvas {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: 0;
  border: none;
}

/* Keep UI visible in fullscreen */
.game-wrap:fullscreen .ui {
  top: 16px;
  right: 16px;
}
</style>
