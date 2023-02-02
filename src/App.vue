<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { NMessageProvider } from "naive-ui";

import Container from "./components/Container.vue";
</script>

<template>
  <n-message-provider>
    <container />
  </n-message-provider>
</template>
