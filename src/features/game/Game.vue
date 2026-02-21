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
        aria-label="Fullscreen">
        <n-icon>
          <Fullscreen />
        </n-icon>
      </n-button>
    </div>

    <!-- Loading overlay -->
    <LoadingOverlay
      v-if="loading"
      :progress="progress"
      :status="status"
      :error="error"
      @retry="boot" />
  </div>
</template>

<script setup>
// Vue imports
import { ref, onMounted, onBeforeUnmount } from "vue";

// Game imports
import Game from "@/features/game/core/Game.js";
import Preloader from "@/features//core/Preloader.js";

// UI imports
import LoadingOverlay from "@/features/game/ui/LoadingOverlay.vue";
import { Fullscreen } from "lucide-vue-next";

// DOM references
const wrap = ref(null);
const canvas = ref(null);
let game = null;

// Loading state
const loading = ref(true);
const progress = ref(0);
const status = ref("Preparing assets...");
const error = ref("");

// Asset manifest (Phase 1: backgrounds only)
function getManifest() {
  return [
    // "/images/5_background/layers/air.png",
    // "/images/5_background/layers/3_third_layer/1.png",
    // "/images/5_background/layers/2_second_layer/1.png",
    // "/images/5_background/layers/1_first_layer/1.png",
  ];
}

// Toggle fullscreen
function toggleFullscreen() {
  const el = wrap.value;
  if (!el) return;

  if (!document.fullscreenElement) el.requestFullscreen();
  else document.exitFullscreen();
}

// Boot game (preload -> start)
async function boot() {
  // Stop existing game instance (for retry)
  game?.stop?.();
  game = null;

  loading.value = true;
  progress.value = 0;
  error.value = "";
  status.value = "Loading images...";

  try {
    const c = canvas.value;
    if (!c) throw new Error("Canvas not available");

    // Setup canvas base size (keep CSS responsive)
    c.width = 800;
    c.height = 450;

    const loader = new Preloader(getManifest());

    const assets = await loader.load((p, url) => {
      progress.value = p;
      status.value = url ? `Loaded: ${url.split("/").pop()}` : "Loaded";
    });

    game = new Game(c, assets);
    game.start();

    loading.value = false;
  } catch (e) {
    error.value = e?.message ?? String(e);
    status.value = "Please retry.";
    loading.value = true;
  }
}

// Mount lifecycle
onMounted(() => {
  boot();
});

// Cleanup lifecycle
onBeforeUnmount(() => {
  game?.stop?.();
  game = null;
});
</script>

<style scoped>
/* Wrapper styles */
.game-wrap {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
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
  z-index: 10;
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
