// src/features/game/Assets.js

/* ============================================================================
  Assets
  - Preloads images and audio (optional)
  - Provides simple getters
  - Also includes a simple sound manager with mute persistence
============================================================================ */

/* ---------------------------------------------------------------------------
  Local Storage Keys
--------------------------------------------------------------------------- */

const STORAGE_KEY_MUTED = "game_muted";

/* ---------------------------------------------------------------------------
  Manifest
--------------------------------------------------------------------------- */

/**
 * @returns {{images: Record<string,string>, sounds: Record<string,string>}}
 */
function createManifest() {
  return {
    images: {
      // Background layers are loaded dynamically from Levels.js paths
      coin: "/images/8_coin/coin_1.png",

      // Enemy normal chicken
      chickenWalk1: "/images/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
      chickenWalk2: "/images/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
      chickenWalk3: "/images/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
      chickenDead: "/images/3_enemies_chicken/chicken_normal/2_dead/dead.png",

      // Character placeholders (you can expand later)
      characterIdle: "/images/2_character_pepe/1_idle/idle/I-1.png",
      characterWalk: "/images/2_character_pepe/2_walk/W-21.png",
      characterJump: "/images/2_character_pepe/3_jump/J-31.png",
    },

    sounds: {
      coin: "/audio/coin.mp3",
      hurt: "/audio/hurt.mp3",
      enemyKill: "/audio/enemy_kill.mp3",
      music: "/audio/music.mp3",
    },
  };
}

/* ---------------------------------------------------------------------------
  Image Loader
--------------------------------------------------------------------------- */

/**
 * Load one image.
 * @param {string} source - Image path
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image failed to load: ${source}`));
    image.src = source;
  });
}

/* ---------------------------------------------------------------------------
  Simple Sound Manager
--------------------------------------------------------------------------- */

class SoundManager {
  constructor() {
    this._muted = this._readMutedFromStorage();
    this._sounds = new Map();
    this._musicAudio = null;
  }

  /**
   * Register a sound.
   * @param {string} key - Sound key
   * @param {string} source - Sound path
   * @param {{loop?: boolean, volume?: number}} options - Audio options
   */
  register(key, source, options = {}) {
    const audio = new Audio(source);
    audio.loop = Boolean(options.loop);
    audio.volume = typeof options.volume === "number" ? options.volume : 0.8;

    this._sounds.set(key, audio);
  }

  /**
   * Play a sound by key.
   * @param {string} key - Sound key
   */
  play(key) {
    if (this._muted) return;

    const audio = this._sounds.get(key);
    if (!audio) return;

    audio.currentTime = 0;
    void audio.play();
  }

  /**
   * Start background music (if registered under "music").
   */
  startMusic() {
    const audio = this._sounds.get("music");
    if (!audio) return;

    this._musicAudio = audio;

    if (this._muted) {
      this._musicAudio.pause();
      return;
    }

    void this._musicAudio.play();
  }

  /** Stop background music. */
  stopMusic() {
    if (!this._musicAudio) return;

    this._musicAudio.pause();
    this._musicAudio.currentTime = 0;
  }

  /** Stop all sounds immediately. */
  stopAll() {
    for (const audio of this._sounds.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /** Toggle mute and persist state. */
  toggleMute() {
    this._muted = !this._muted;
    this._writeMutedToStorage(this._muted);

    if (this._muted) this.stopAll();
    else this.startMusic();
  }

  /**
   * @returns {boolean}
   */
  isMuted() {
    return this._muted;
  }

  /**
   * @returns {boolean}
   */
  _readMutedFromStorage() {
    const value = localStorage.getItem(STORAGE_KEY_MUTED);
    return value === "true";
  }

  /**
   * @param {boolean} muted - Mute state
   */
  _writeMutedToStorage(muted) {
    localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
  }
}

/* ---------------------------------------------------------------------------
  Assets Container
--------------------------------------------------------------------------- */

export class Assets {
  constructor() {
    this.manifest = createManifest();
    this.images = new Map();
    this.sounds = new SoundManager();
  }

  /**
   * Load all manifest images and register sounds.
   * @param {string[]} extraImageSources - Extra images to preload (e.g. level backgrounds)
   */
  async loadAll(extraImageSources = []) {
    const manifestImages = Object.values(this.manifest.images);
    const allSources = [...new Set([...manifestImages, ...extraImageSources])];

    for (const source of allSources) {
      const image = await loadImage(source);
      this.images.set(source, image);
    }

    this._registerDefaultSounds();
  }

  /**
   * Get preloaded image by source path.
   * @param {string} source - Image path
   * @returns {HTMLImageElement | null}
   */
  getImageBySource(source) {
    return this.images.get(source) ?? null;
  }

  _registerDefaultSounds() {
    const sounds = this.manifest.sounds;

    this.sounds.register("coin", sounds.coin, { volume: 0.6 });
    this.sounds.register("hurt", sounds.hurt, { volume: 0.7 });
    this.sounds.register("enemyKill", sounds.enemyKill, { volume: 0.7 });
    this.sounds.register("music", sounds.music, { volume: 0.3, loop: true });
  }
}

export { SoundManager };
