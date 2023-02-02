<script setup lang="ts">
import {
  NLayout,
  NSpace,
  NLayoutHeader,
  NLayoutContent,
  NLayoutSider,
  NLayoutFooter,
  NInput,
  useMessage,
  NSwitch,
} from "naive-ui";

import { ref } from "vue";

const inputString = ref(null);
const masterItems = ref([{ id: -1, title: "First do a search" }]);
const releaseItems = ref([{ id: -1, title: "No master release selected" }]);
const inverted = ref(false);

const message = useMessage();
const handleKeyUp = (e) => {
  if (e.key === "Enter") {
    // send request
    searchMasterRelease();
    message.info("[Event keyup]");
  }
};
const handleMasterClick = (e) => {
  e.preventDefault();
  console.log("handleMasterClick", e.target.dataset.id);
  searchReleaseItems(e.target.dataset.id);
};
// Search Master Release
const searchMasterRelease = () => {
  const fetchUrl =
    "https://api.discogs.com/database/search?format=7%22&type=master&q=" +
    inputString.value;

  fetch(fetchUrl, {
    method: "GET",
    headers: {
      Authorization: `Discogs token=${import.meta.env.VITE_DISCOGS_API_TOKEN}`,
      "User-Agent": "DiscogsRapidSearcher/0.1 +https://wendbaar.nl",
    },
  })
    .then((res) => res.json())
    .then((data) => (masterItems.value = data.results))
    .catch(console.error.bind(console));
  console.log("masterItems", masterItems);
};
// Search Master Release
const searchReleaseItems = (masterId) => {
  const fetchUrl = `https://api.discogs.com/masters/${masterId}/versions?format=7%22`;

  fetch(fetchUrl, {
    method: "GET",
    headers: {
      Authorization: `Discogs token=${import.meta.env.VITE_DISCOGS_API_TOKEN}`,
      "User-Agent": "DiscogsRapidSearcher/0.1 +https://wendbaar.nl",
    },
  })
    .then((res) => res.json())
    .then((data) => (releaseItems.value = data.versions))
    .catch(console.error.bind(console));
  console.log("releaseItems", releaseItems);
};
</script>

<template>
  <div style="height: 100vh; position: relative">
    <n-layout position="absolute">
      <n-layout-header
        style="height: 64px; padding: 24px"
        bordered
        :inverted="inverted"
      >
        <n-input
          v-model:value="inputString"
          type="text"
          placeholder="Search for artist / Title"
          autofocus
          @keyup="handleKeyUp"
        />
      </n-layout-header>
      <n-layout has-sider position="absolute" style="top: 64px; bottom: 64px">
        <n-layout-sider
          bordered
          content-style="padding: 24px;"
          :inverted="inverted"
          width="500"
        >
          <div
            v-for="item in masterItems"
            :key="item.id"
            class="master-item"
            @click="handleMasterClick"
            :data-id="item.id"
          >
            <img
              :src="item.thumb"
              style="max-height: 50px; vertical-align: middle"
            />
            {{ item.title }}
          </div>
        </n-layout-sider>
        <n-layout-content content-style="padding: 24px;">
          <div
            v-for="item in releaseItems"
            :key="item.id"
            class="release-item"
            :data-id="item.id"
          >
            <img
              :src="item.thumb"
              style="max-height: 50px; vertical-align: middle"
            />
            {{ item.title }}
          </div>
        </n-layout-content>
      </n-layout>
      <n-layout-footer
        bordered
        position="absolute"
        style="height: 64px; padding: 24px"
        :inverted="inverted"
      >
        <n-space> <n-switch v-model:value="inverted" /> inverted </n-space>
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<style scoped>
.release-item:nth-child(even),
.master-item:nth-child(even) {
  background: #f1f1f1;
}
</style>
