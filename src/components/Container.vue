<script setup lang="ts">
import { ref } from "vue";
import type { MasterItem, Version, Release } from "./interfaces";
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NInput,
  useMessage,
  NGrid,
  NGridItem,
  NH2,
  NH3,
  NSpin,
} from "naive-ui";
const message = useMessage();
const inputString = ref();
let searchingMasters = ref(false);
let searchingVersions = ref(false);
let searchingDetails = ref(false);

const masterItems = ref<Array<MasterItem>>([
  { id: -1, title: "First do a search" },
]);
const versionItems = ref<Array<Version>>([
  { id: -1, title: "No master selected" },
]);
const releaseDetails = ref<Release>();

const handleKeyUp = (e: any) => {
  if (e.key === "Enter") {
    // send request
    searchMasterRelease();
    message.info("[Event keyup]");
  }
};
const handleMasterClick = (e: any) => {
  e.preventDefault();
  const selectedMasterItemId = +e.target.dataset.id;
  masterItems.value.forEach((masterItem) => {
    masterItem.selected = masterItem.id === selectedMasterItemId;
  });
  searchVersion(selectedMasterItemId);
};
const handleReleaseClick = (e: any) => {
  e.preventDefault();
  const selectedReleaseItemId = +e.target.dataset.id;
  versionItems.value.forEach((versionItem) => {
    versionItem.selected = versionItem.id === selectedReleaseItemId;
  });
  searchReleases(selectedReleaseItemId);
};

const requestHeaders = {
  Authorization: `Discogs token=${import.meta.env.VITE_DISCOGS_API_TOKEN}`,
  "User-Agent": "DiscogsRapidSearcher/0.1 +https://wendbaar.nl",
};

const fetchData = (fetchUrl: string, callback?: any): Promise<T> => {
  return fetch(fetchUrl, {
    method: "GET",
    headers: requestHeaders,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<T>;
    })
    .catch(console.error.bind(console));
};

const searchMasterRelease = () => {
  const fetchUrl =
    "https://api.discogs.com/database/search?format=7%22&type=master&q=" +
    inputString.value;
  searchingMasters.value = true;
  fetchData(fetchUrl)
    .then((data: any) => (masterItems.value = data.results))
    .then(() => (searchingMasters.value = false));
};

const searchVersion = (masterId: number) => {
  const fetchUrl = `https://api.discogs.com/masters/${masterId}/versions?format=7%22`;
  searchingVersions.value = true;
  fetchData(fetchUrl)
    .then((data: any) => (versionItems.value = data.versions))
    .then(() => (searchingVersions.value = false));
};

const searchReleases = (releaseId: number) => {
  const fetchUrl = `https://api.discogs.com/releases/${releaseId}`;
  searchingDetails.value = true;
  fetchData(fetchUrl)
    .then((data: any) => (releaseDetails.value = data))
    .then(() => (searchingDetails.value = false));
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
            <n-grid-item>
              <n-spin :show="searchingMasters">
                <n-h3>Master</n-h3>
              </n-spin>
              <div
                v-for="item in masterItems"
                :key="item.id"
                class="master-item"
                :class="[item.selected ? 'selected' : '']"
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
            <n-grid-item>
              <n-spin :show="searchingVersions">
                <n-h3>Version</n-h3>
              </n-spin>
              <div
                v-for="item in versionItems"
                :key="item.id"
                class="release-item"
                :class="[
                  item.selected ? 'selected' : '',
                  item.stats?.user.in_collection ? 'in_collection' : '',
                  item.stats?.user.in_wantlist ? 'in_wantlist' : '',
                ]"
                @click="handleReleaseClick"
                :data-id="item.id"
              >
                <img
                  :src="item.thumb"
                  style="max-height: 50px; vertical-align: middle"
                />
                {{ item.title }}
              </div>
            </n-grid-item>
            <n-grid-item>
              <n-spin :show="searchingDetails">
                <n-h3>Details</n-h3>
              </n-spin>
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
.selected {
  background-color: blue !important;
}
</style>
