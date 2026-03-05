<script setup></script>

<template>
  <n-card size="huge" :bordered="false">
    <n-space vertical size="large" class="wrap">
      <n-page-header title="Impressum" subtitle="Angaben gemäß § 5 TMG">
        <template #extra>
          <router-link to="/">
            <n-button secondary type="primary">← Zurück zum Spiel</n-button>
          </router-link>
        </template>
      </n-page-header>

      <n-card title="Anbieter" size="large">
        <n-text>
          Señor Pollo Loco<br />
          Calle del Hühnerstall 7<br />
          99999 El Chicken Village<br />
          Republik der verrückten Hühner
        </n-text>
      </n-card>

      <n-card title="Kontakt" size="large">
        <n-text>
          Telefon: +49 1800 POLLO<br />
          E-Mail: pollo@loco-game.dev
        </n-text>
      </n-card>

      <n-card title="Verantwortlich für den Inhalt" size="large">
        <n-text>
          Verantwortlich nach § 55 Abs. 2 RStV:<br />
          Señor Pollo Loco<br />
          Calle del Hühnerstall 7<br />
          99999 El Chicken Village
        </n-text>
      </n-card>

      <n-card title="Haftung für Inhalte" size="large">
        <n-text>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.
          Trotzdem kann es vorkommen, dass ein Huhn über die Tastatur läuft und
          dabei kleine Fehler entstehen.
        </n-text>
      </n-card>

      <n-card title="Haftung für Links" size="large">
        <n-text>
          Unser Angebot enthält Links zu externen Websites. Für deren Inhalte
          übernehmen wir keine Verantwortung – selbst wenn sie von besonders
          frechen Hühnern stammen.
        </n-text>
      </n-card>

      <n-card title="Urheberrecht" size="large">
        <n-text>
          Alle Inhalte dieses Spiels und dieser Seite gehören ihren jeweiligen
          Entwicklern und dürfen nicht ohne Erlaubnis kopiert werden – auch
          nicht von besonders talentierten Hühnern.
        </n-text>
      </n-card>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NAlert, NCard, NDivider, NPageHeader, NSpace, NText } from "naive-ui";
</script>

<style scoped>
.wrap {
  max-width: 920px;
  margin: 0 auto;
  padding: 48px 16px;
}
</style>
