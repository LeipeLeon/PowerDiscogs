<script setup lang="ts">
import {
  NLayout,
  NSpace,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NLayoutFooter,
  NH2,
  NInput,
  useMessage,
  NMessageProvider,
} from "naive-ui";

import { ref } from "vue";

const inputString = ref(null);

const message = useMessage();
const handleKeyUp = (e) => {
  if (e.key === "Enter") {
    // send request
    message.info("[Event keyup]");
  }
};
</script>

<template>
  <div style="height: 100vh; position: relative">
    <n-layout position="absolute">
      <n-layout-header style="height: 64px; padding: 24px" bordered>
        <n-input
          v-model:value="inputString"
          type="text"
          placeholder="Basic Input"
          autofocus
          @keyup="handleKeyUp"
        />
      </n-layout-header>
      <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px">
        <n-layout-sider bordered content-style="padding: 24px;">
          <!-- <n-input
            v-model:value="inputString"
            type="textarea"
            placeholder="Basic Textarea"
          /> -->
        </n-layout-sider>
        <n-layout content-style="padding: 24px;">
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
          <n-h2>Pingshan Road</n-h2>
        </n-layout>
      </n-layout>
      <n-layout-footer
        bordered
        position="absolute"
        style="height: 64px; padding: 24px"
      >
        城府路
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<style scoped>
.n-layout-header,
.n-layout-footer {
  background: rgba(128, 128, 128, 0.2);
  padding: 24px;
}

.n-layout-sider {
  background: rgba(128, 128, 128, 0.3);
}

.n-layout-content {
  background: rgba(128, 128, 128, 0.4);
}
</style>
