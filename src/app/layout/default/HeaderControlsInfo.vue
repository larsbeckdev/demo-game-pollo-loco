<template>
  <n-button
    quaternary
    circle
    size="small"
    @click="show = true"
    aria-label="Steuerung">
    <n-icon :size="18">
      <Info />
    </n-icon>
  </n-button>

  <n-modal v-model:show="show">
    <n-card title="Steuerung" :bordered="false" class="modalCard">
      <!-- Desktop only -->
      <n-card class="deviceCard desktopOnly" :bordered="false">
        <!-- <n-text strong>Desktop</n-text> -->

        <div class="kbd">
          <div class="row center">
            <n-button strong secondary size="tiny" type="primary" class="key"
              >W</n-button
            >
          </div>

          <div class="row">
            <n-button strong secondary size="small" type="primary" class="key"
              >A</n-button
            >
            <n-button strong secondary size="small" type="primary" class="key"
              >S</n-button
            >
            <n-button strong secondary size="small" type="primary" class="key"
              >D</n-button
            >
          </div>

          <div class="row">
            <n-button
              strong
              secondary
              size="small"
              type="primary"
              class="shift">
              SHIFT
            </n-button>
            <n-button
              strong
              secondary
              size="small"
              type="primary"
              class="space">
              SPACE
            </n-button>
          </div>
        </div>
      </n-card>

      <!-- Mobile only -->
      <n-card class="deviceCard mobileOnly" :bordered="false">
        <!-- <n-text strong>Mobile</n-text> -->

        <div class="kbd">
          <div class="row center">
            <n-button size="small" type="primary" class="key">W</n-button>
          </div>

          <div class="row">
            <n-button size="small" type="primary" class="key">A</n-button>
            <n-button size="small" type="primary" class="key">S</n-button>
            <n-button size="small" type="primary" class="key">D</n-button>
          </div>

          <div class="row">
            <n-button size="small" type="primary" class="space">
              SPACE
            </n-button>
          </div>
        </div>
      </n-card>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NButton, NModal, NCard, NIcon, NText } from "naive-ui";
import { Info } from "lucide-vue-next";

const show = ref(false);
</script>

<style scoped>
/* Modal responsive width */
.modalCard {
  width: min(92vw, 360px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Inner cards spacing */
.deviceCard {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Keyboard layout */
.kbd {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.center {
  justify-content: center;
}

.key,
.shift,
.space {
  height: 38px;
  font-weight: 600;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.key {
  width: 38px;
}
.shift {
  width: 90px;
}
.space {
  width: 180px;
}

/* Visibility toggles */
.desktopOnly {
  display: none;
}
.mobileOnly {
  display: block;
}

/* >= 768px: show desktop, hide mobile */
@media (min-width: 768px) {
  .modalCard {
    width: 360px;
  }

  .desktopOnly {
    display: block;
  }
  .mobileOnly {
    display: none;
  }
}
</style>
