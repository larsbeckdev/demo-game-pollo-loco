<template>
  <n-button
    type="info"
    quaternary
    size="small"
    @click="show = true"
    aria-label="Steuerung">
    <template #icon>
      <n-icon :size="18">
        <Info />
      </n-icon>
    </template>
    Steuerung
  </n-button>

  <n-modal v-model:show="show">
    <n-card title="Steuerung" :bordered="false" class="modalCard">
      <!-- Desktop only -->
      <n-card class="deviceCard desktopOnly" :bordered="false">
        <div class="kbd">
          <div class="row center">
            <n-button strong secondary size="tiny" type="primary" class="key"
              >W</n-button
            >
          </div>

          <div class="row">
            <n-button strong secondary size="tiny" type="primary" class="key"
              >A</n-button
            >
            <n-button strong secondary size="tiny" type="primary" class="key"
              >S</n-button
            >
            <n-button strong secondary size="tiny" type="primary" class="key"
              >D</n-button
            >
          </div>

          <div class="row">
            <!-- ✅ ENTER statt SHIFT -->

            <n-button strong secondary size="tiny" type="primary" class="space"
              >SPACE</n-button
            >
            <n-button strong secondary size="tiny" type="primary" class="enter"
              >ENTER</n-button
            >
          </div>

          <div class="legend">
            <div><span class="dot"></span> A / D = Laufen</div>
            <div><span class="dot"></span> SPACE = Springen</div>
            <div><span class="dot"></span> ENTER / Mouse Click = Werfen</div>
          </div>
        </div>
      </n-card>

      <!-- Mobile only (Touch Controls) -->
      <n-card class="deviceCard mobileOnly" :bordered="false">
        <div class="touchMap">
          <!-- Left Pad -->
          <div class="pad">
            <div class="padTitle">Move</div>
            <div class="padRow">
              <div class="touchBtn">
                <n-icon :size="22"><ChevronLeft /></n-icon>
              </div>
              <div class="touchBtn">
                <n-icon :size="22"><ChevronRight /></n-icon>
              </div>
            </div>
            <div class="padHint">Hold to move</div>
          </div>

          <!-- Right Pad -->
          <div class="pad">
            <div class="padTitle">Actions</div>
            <div class="padRow">
              <div class="touchBtn touchBtnBig">
                <n-icon :size="22"><ArrowUp /></n-icon>
              </div>
              <div class="touchBtn touchBtnBig">
                <n-icon :size="22"><Flame /></n-icon>
              </div>
            </div>
            <div class="padHint">Tap to jump / throw</div>
          </div>
        </div>

        <div class="legend">
          <div><span class="dot"></span> ◀ / ▶ = Laufen</div>
          <div><span class="dot"></span> ↑ = Springen</div>
          <div><span class="dot"></span> 🔥 = Werfen</div>
        </div>
      </n-card>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NButton, NModal, NCard, NIcon } from "naive-ui";
import {
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Flame,
} from "lucide-vue-next";

const show = ref(false);
</script>

<style scoped>
/* Modal responsive width */
.modalCard {
  width: min(92vw, 380px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Inner cards spacing */
.deviceCard {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Desktop keyboard layout */
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
.enter,
.mouse,
.space {
  height: 28px;
  font-weight: 600;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.key {
  width: 28px;
  padding: 0;
}

.enter {
  width: 90px;
}

.mouse {
  width: 180px;
}

.space {
  width: 180px;
}

/* Mobile touch map */
.touchMap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pad {
  border-radius: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.06);
}

.padTitle {
  font-weight: 700;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.padRow {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.padHint {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
}

/* “Touch button” look like in game */
.touchBtn {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: grid;
  place-items: center;

  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  backdrop-filter: blur(10px);
}

.touchBtnBig {
  width: 54px;
  height: 54px;
}

/* Legend */
.legend {
  display: grid;
  gap: 6px;
  font-size: 12px;
  opacity: 0.85;
  margin-top: 8px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  margin-right: 8px;
  opacity: 0.6;
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
    width: 420px;
  }

  .desktopOnly {
    display: block;
  }
  .mobileOnly {
    display: none;
  }
}
</style>
