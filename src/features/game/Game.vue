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
          <!-- Fullscreen icon -->
        </n-icon>
      </n-button>
    </div>
  </div>
</template>

<script setup>
// Vue imports
import { ref, onMounted, onBeforeUnmount } from "vue"; // Vue lifecycle
import Game from "@/features/game/core/Game.js"; // Game class
import { Fullscreen } from "lucide-vue-next"; // Icon import

// DOM references
const wrap = ref(null); // Wrapper ref
const canvas = ref(null); // Canvas ref
let game; // Game instance

// Toggle fullscreen
function toggleFullscreen() {
  const el = wrap.value; // Get wrapper
  if (!document.fullscreenElement)
    el.requestFullscreen(); // Enter fullscreen
  else document.exitFullscreen(); // Exit fullscreen
}

// Mount lifecycle
onMounted(() => {
  const c = canvas.value; // Canvas element
  c.width = 800; // Set width
  c.height = 450; // Set height

  game = new Game(c); // Create game
  game.start(); // Start loop
});

// Cleanup lifecycle
onBeforeUnmount(() => {
  game?.stop(); // Stop loop
});
</script>

<style scoped>
/* Wrapper styles */
.game-wrap {
  position: relative; /* Relative layout */
  width: 100%; /* Full width */
  max-width: 900px; /* Max width */
  margin: 0 auto; /* Center container */
}

/* Canvas styles */
.game-canvas {
  width: 100%; /* Responsive width */
  aspect-ratio: 16 / 9; /* Fixed ratio */
  display: block; /* Remove gap */
  background: var(--ds-card-bg); /* Canvas background */
  border: 1px solid var(--ds-border); /* Canvas border */
  border-radius: 8px; /* Rounded corners */
}

/* UI overlay */
.ui {
  position: absolute; /* Overlay position */
  top: 12px; /* Top offset */
  right: 12px; /* Right offset */
  z-index: 10; /* Above canvas */
}

/* Fullscreen wrapper */
.game-wrap:fullscreen {
  width: 100vw; /* Full viewport */
  height: 100vh; /* Full height */
  max-width: none; /* Remove limit */
  margin: 0; /* Remove margin */
}

/* Fullscreen canvas */
.game-wrap:fullscreen .game-canvas {
  width: 100%; /* Fill width */
  height: 100%; /* Fill height */
  aspect-ratio: auto; /* Disable ratio */
  border-radius: 0; /* Remove radius */
}
</style>
