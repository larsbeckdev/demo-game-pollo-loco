// src/features/game/Time.js

/* ============================================================================
  Time
  - Calculates stable delta time for animation and physics
  - Prevents extreme spikes after tab switching
============================================================================ */

/**
 * Create a time controller.
 * @returns {{
 *   lastTimestamp: number,
 *   getDeltaFrames: (timestamp: number) => number,
 *   reset: () => void
 * }}
 */
export function createTime() {
  return {
    lastTimestamp: 0,

    /**
     * Convert timestamps to dt-units:
     * - dt = 1 means ~16.67ms (60fps)
     * @param {number} timestamp - requestAnimationFrame timestamp
     * @returns {number}
     */
    getDeltaFrames(timestamp) {
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = timestamp;
        return 1;
      }

      const deltaMilliseconds = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      const deltaFrames = deltaMilliseconds / (1000 / 60);

      return clampDeltaFrames(deltaFrames);
    },

    /** Reset timing (for restart). */
    reset() {
      this.lastTimestamp = 0;
    },
  };
}

/**
 * Clamp delta frames to avoid crazy catch-up.
 * @param {number} deltaFrames - Computed dt
 * @returns {number}
 */
function clampDeltaFrames(deltaFrames) {
  const minimum = 0;
  const maximum = 3;

  if (deltaFrames < minimum) return minimum;
  if (deltaFrames > maximum) return maximum;

  return deltaFrames;
}
