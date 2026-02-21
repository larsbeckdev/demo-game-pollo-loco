<template>
  <AppPreloader :visible="visible" :progress="progress" :message="message" />

  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import AppPreloader from "@/components/preloader/AppPreloader.vue";
import { useAppPreloader } from "@/components/preloader/useAppPreloader";

const { visible, progress, message, setProgress, finish } = useAppPreloader();

onMounted(async () => {
  // Simulierter Boot-Prozess
  setProgress(0.2, "Loading configuration...");
  await wait(400);

  setProgress(0.5, "Initializing services...");
  await wait(400);

  setProgress(0.8, "Almost ready...");
  await wait(400);

  finish();
});

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
</script>
