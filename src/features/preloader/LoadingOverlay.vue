<template>
  <div class="overlay">
    <n-card class="loaderCard" :bordered="false">
      <n-space vertical size="large">
        <n-spin size="large" />
        <div class="title">Loading… {{ Math.round(progress * 100) }}%</div>

        <n-progress type="line" :percentage="Math.round(progress * 100)" />

        <n-text depth="3">
          {{ status }}
        </n-text>

        <n-alert v-if="error" type="error" title="Loading failed">
          {{ error }}
        </n-alert>

        <n-button v-if="error" type="primary" @click="$emit('retry')">
          Retry
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
defineProps({
  progress: Number,
  status: String,
  error: String,
});
</script>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  backdrop-filter: blur(6px);
}

.loaderCard {
  width: min(420px, 100%);
}

.title {
  font-weight: 700;
  font-size: 18px;
}
</style>
