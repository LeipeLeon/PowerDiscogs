<script setup lang="ts">
// import { RouterLink, RouterView } from "vue-router";
import {
  NMessageProvider,
  NWatermark,
  NDialogProvider,
  NConfigProvider,
} from "naive-ui";

import Container from "./components/Container.vue";

const themeOverrides = {
  // Radio: {
  //   textColor: "rgba(255, 255, 255, 1)",
  // },
};
</script>

<template>
  <n-message-provider>
    <n-config-provider :theme-overrides="themeOverrides">
      <n-dialog-provider>
        <container />
      </n-dialog-provider>
    </n-config-provider>
  </n-message-provider>
  <n-watermark
    content="PROOF OF CONCEPT"
    cross
    fullscreen
    :font-size="16"
    :line-height="16"
    :width="384"
    :height="384"
    :x-offset="12"
    :y-offset="80"
    :rotate="-15"
    font-color="rgba(128, 0, 0, 0.3)"
  />
</template>
