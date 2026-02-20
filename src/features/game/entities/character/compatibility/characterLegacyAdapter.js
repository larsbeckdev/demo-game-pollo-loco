export function applyLegacyCharacterInterface(CharacterClass) {
  const prototype = CharacterClass.prototype;

  Object.defineProperties(prototype, {
    x: {
      get() {
        return this.positionX;
      },
      set(value) {
        this.positionX = value;
      },
    },

    y: {
      get() {
        return this.positionY;
      },
      set(value) {
        this.positionY = value;
      },
    },

    w: {
      get() {
        return this.width;
      },
      set(value) {
        this.width = value;
      },
    },

    h: {
      get() {
        return this.height;
      },
      set(value) {
        this.height = value;
      },
    },

    vx: {
      get() {
        return this.horizontalVelocity;
      },
      set(value) {
        this.horizontalVelocity = value;
      },
    },

    vy: {
      get() {
        return this.verticalVelocity;
      },
      set(value) {
        this.verticalVelocity = value;
      },
    },

    facing: {
      get() {
        return this.facingDirection;
      },
      set(value) {
        this.facingDirection = value;
      },
    },

    onGround: {
      get() {
        return this.isOnGround;
      },
      set(value) {
        this.isOnGround = value;
      },
    },

    dead: {
      get() {
        return this.isDead;
      },
      set(value) {
        this.isDead = value;
      },
    },

    hurtActive: {
      get() {
        return this.isHurt;
      },
      set(value) {
        this.isHurt = value;
      },
    },

    anims: {
      get() {
        return this.animations;
      },
      set(value) {
        this.animations = value;
      },
    },

    currentAnimKey: {
      get() {
        return this.currentAnimationKey;
      },
      set(value) {
        this.currentAnimationKey = value;
      },
    },

    groundY: {
      get() {
        return this.groundLevel;
      },
      set(value) {
        this.groundLevel = value;
      },
    },
  });
}
