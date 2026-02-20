<script setup lang="ts">
import LogoSecondary from "@/components/logo/LogoSecondary.vue";
import ThemeToggle from "@/features/theme-toggle/ThemeToggle.vue";
import { Github } from "lucide-vue-next";
import HeaderControlsInfo from "@/app/layout/default/HeaderControlsInfo.vue";
</script>

<template>
  <div class="logo-box flex items-center gap-2">
    <!-- <LogoSecondary class="h-full" /> -->
    <div class="flex flex-col leading-tight">
      <n-h3 style="margin: 0">El Pollo Loco</n-h3>
      <!-- <n-text depth="3">Search + Type Filters + Cache</n-text> -->
    </div>
  </div>

  <n-space class="header-controls items-center"  >
    <HeaderControlsInfo />

    <n-button
      tertiary
      tag="a"
      href="https://github.com/larsbeckdev/demo-game-pollo-loco"
      target="_blank"
      rel="noopener noreferrer">
      <span class="inline-flex items-center gap-2">
        <n-icon>
          <Github />
        </n-icon>
        <span class="hidden sm:block">GitHub</span>
      </span>
    </n-button>

    <ThemeToggle />
  </n-space>
</template>
