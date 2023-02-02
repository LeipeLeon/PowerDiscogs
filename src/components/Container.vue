<script setup lang="ts">
import { ref } from "vue";

import {
  NLayout,
  NSpace,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NInput,
  useMessage,
  NGrid,
  NGridItem,
  NH2,
  NH3,
} from "naive-ui";

interface MasterItem {
  id: number;
  title: string;
  thumb?: string;
}
interface ReleaseItem {
  id: number;
  title: string;
  thumb?: string;
  stats?: {
    user: {
      in_collection: number;
      in_wantlist: number;
    };
  };
}
interface ReleaseDetail {
  id: number;
  title: string;
  thumb?: string;
  artists_sort?: string;
  num_for_sale?: number;
  lowest_price?: number;
}

const inputString = ref(null);
const masterItems = ref<Array<MasterItem>>([
  { id: -1, title: "First do a search" },
]);
const releaseItems = ref<Array<ReleaseItem>>([
  { id: -1, title: "No master selected" },
]);
const releaseDetails = ref<ReleaseDetail>();

const message = useMessage();
const handleKeyUp = (e: any) => {
  if (e.key === "Enter") {
    // send request
    searchMasterRelease();
    message.info("[Event keyup]");
  }
};
const handleMasterClick = (e: any) => {
  e.preventDefault();
  console.log("handleMasterClick", e.target.dataset.id);
  searchReleaseItems(e.target.dataset.id);
};
const handleReleaseClick = (e: any) => {
  e.preventDefault();
  console.log("handleReleaseClick", e.target.dataset.id);
  searchReleaseDetails(e.target.dataset.id);
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

const searchReleaseItems = (masterId: number) => {
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

const searchReleaseDetails = (releaseId: number) => {
  const fetchUrl = `https://api.discogs.com/releases/${releaseId}`;

  fetch(fetchUrl, {
    method: "GET",
    headers: {
      Authorization: `Discogs token=${import.meta.env.VITE_DISCOGS_API_TOKEN}`,
      "User-Agent": "DiscogsRapidSearcher/0.1 +https://wendbaar.nl",
    },
  })
    .then((res) => res.json())
    .then((data) => (releaseDetails.value = data))
    .catch(console.error.bind(console));
  console.log("releaseDetails", releaseDetails);
};
</script>

<template>
  <div style="height: 100vh; position: relative">
    <n-layout position="absolute">
      <n-layout-header style="padding: 1rem" bordered inverted>
        <n-input
          v-model:value="inputString"
          type="text"
          placeholder="Search for artist / Title"
          autofocus
          @keyup="handleKeyUp"
        />
      </n-layout-header>
      <n-layout position="absolute" style="top: 64px; bottom: 64px">
        <n-layout-content content-style="padding: 12px">
          <n-grid cols="3" x-gap="12">
            <n-grid-item
              ><n-h3>Master</n-h3>
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
              </div></n-grid-item
            >
            <n-grid-item
              ><n-h3>Version</n-h3>
              <div
                v-for="item in releaseItems"
                :key="item.id"
                class="release-item"
                @click="handleReleaseClick"
                :data-id="item.id"
                :class="
                  item.stats?.user.in_collection
                    ? 'in_collection'
                    : '' && item.stats?.user.in_wantlist
                    ? 'in_wantlist'
                    : ''
                "
              >
                <img
                  :src="item.thumb"
                  style="max-height: 50px; vertical-align: middle"
                />
                {{ item.title }}
              </div>
            </n-grid-item>
            <n-grid-item
              ><n-h3>Details</n-h3>
              <div v-if="releaseDetails">
                <n-h2>
                  {{ releaseDetails.artists_sort }}
                  -
                  {{ releaseDetails.title }}
                </n-h2>
                <img :src="releaseDetails.thumb" />
                <dl>
                  <dt>For sale:</dt>
                  <dd>{{ releaseDetails.num_for_sale }}</dd>
                  <dt>Lowest Price:</dt>
                  <dd>{{ releaseDetails.lowest_price }} EUR</dd>
                </dl>
              </div>
              <n-h2 v-else>No Version selected</n-h2>
            </n-grid-item>
          </n-grid>
        </n-layout-content>
      </n-layout>
      <n-layout-footer
        bordered
        position="absolute"
        style="height: 64px; padding: 24px"
      >
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<style scoped>
.release-item:nth-child(even),
.master-item:nth-child(even) {
  background-color: #f1f1f1;
}
.in_collection {
  background-color: green !important;
}
.in_wantlist {
  background-color: red !important;
}
</style>
