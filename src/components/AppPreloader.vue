<template>
  <transition name="fade">
    <div v-if="visible" class="preloader">
      <n-card class="card" :bordered="false">
        <n-space vertical size="large">
          <!-- <n-spin size="large" /> -->

          <div class="title">Loading… {{ Math.round(progress * 100) }}%</div>

          <n-progress type="line" :percentage="Math.round(progress * 100)" />

          <n-text depth="3">
            {{ message }}
          </n-text>
        </n-space>
      </n-card>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  progress: {
    type: Number,
    default: 0,
  },
  message: {
    type: String,
    default: "Preparing application...",
  },
});
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  background: var(--ds-background, #111);
}

.card {
  width: min(420px, 90%);
  background: var(--ds-card-bg, #222);
}

.title {
  font-weight: 700;
  font-size: 18px;
  color: var(--ds-text, #eee);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
