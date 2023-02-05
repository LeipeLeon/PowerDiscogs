<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { MasterItem, Version, Release } from "./interfaces";
import {
  NAvatar,
  NBadge,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NIcon,
  NInput,
  useMessage,
  NGrid,
  NGridItem,
  NH2,
  NH3,
  NSpin,
  NList,
  NListItem,
  NThing,
  NScrollbar,
  NStatistic,
} from "naive-ui";
import { Library16Filled, Eye16Regular } from "@vicons/fluent";

const message = useMessage();
const inputString = ref();
let searchingMasters = ref(false);
let searchingVersions = ref(false);
let searchingDetails = ref(false);
let apiToken = ref<string | null>("");

const masterItems = ref<Array<MasterItem>>([
  { id: -1, title: "First do a search" },
]);
const versionItems = ref<Array<Version>>([
  { id: -1, title: "No master selected" },
]);
const releaseDetails = ref<Release>();

const handleKeyUp = (e: any) => {
  searchMasterRelease();
};
const handleMasterClick = (id: number) => {
  const selectedMasterItemId = +id;
  masterItems.value.forEach((masterItem) => {
    masterItem.selected = masterItem.id === selectedMasterItemId;
  });
  searchVersion(selectedMasterItemId);
};
const handleReleaseClick = (id: number) => {
  const selectedReleaseItemId = +id;
  versionItems.value.forEach((versionItem) => {
    versionItem.selected = versionItem.id === selectedReleaseItemId;
  });
  searchReleases(selectedReleaseItemId);
};

const setApiToken = () => {
  message.info("API Key saved!");
  localStorage.setItem("DISCOGS_API_TOKEN", apiToken.value || "");
};

const getApiToken = () => {
  apiToken.value = localStorage.getItem("DISCOGS_API_TOKEN");
};

const requestHeaders = () => {
  return {
    Authorization: "Discogs token=" + apiToken.value,
    "User-Agent": "DiscogsRapidSearcher/0.1 +https://wendbaar.nl",
  };
};

const fetchData = (fetchUrl: string): Promise<any> => {
  if (apiToken.value) {
    return fetch(fetchUrl, {
      method: "GET",
      headers: requestHeaders(),
    })
      .then((response) => {
        if (!response.ok) {
          message.error(
            response.status + ": Something went wrong! (See console log) "
          );
          console.log("response", response);
          throw new Error(response.statusText);
        }
        return response.json() as Promise<object>;
      })
      .catch(console.error.bind(console));
  } else {
    message.error("No API token set!");
    return Promise.reject("No API Key available");
  }
};

const searchMasterRelease = () => {
  const fetchUrl =
    "https://api.discogs.com/database/search?format=Single&type=master&q=" +
    inputString.value;
  searchingMasters.value = true;
  fetchData(fetchUrl)
    .then((data: any) => (masterItems.value = data.results))
    .finally(() => {
      searchingMasters.value = false;
    });
};

const searchVersion = (masterId: number) => {
  const fetchUrl = `https://api.discogs.com/masters/${masterId}/versions?format=7%22`;
  searchingVersions.value = true;
  fetchData(fetchUrl)
    .then((data: any) => (versionItems.value = data.versions))
    .finally(() => {
      searchingVersions.value = false;
    });
};

const searchReleases = (releaseId: number) => {
  const fetchUrl = `https://api.discogs.com/releases/${releaseId}`;
  searchingDetails.value = true;
  fetchData(fetchUrl)
    .then((data: any) => (releaseDetails.value = data))
    .finally(() => {
      searchingDetails.value = false;
    });
};

onMounted(() => {
  getApiToken();
});
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
          @keyup.enter="handleKeyUp"
        />
      </n-layout-header>
      <n-layout position="absolute" style="top: 64px; bottom: 88px">
        <n-layout-content content-style="padding: 12px">
          <n-grid cols="3" x-gap="12">
            <n-grid-item>
              <n-spin :show="searchingMasters">
                <n-h3>Master</n-h3>
              </n-spin>
              <n-scrollbar trigger="none" style="max-height: 75vh">
                <n-list hoverable clickable>
                  <n-list-item
                    v-for="item in masterItems"
                    :key="item.id"
                    class="master-item"
                    @click.prevent="handleMasterClick(+item.id)"
                    :data-id="item.id"
                  >
                    <template #suffix>
                      <div v-if="item.selected">
                        <img src="@/assets/arrowRight.svg" height="44" />
                      </div>
                    </template>
                    <n-thing
                      :title="item.title"
                      :description="item?.format?.join(', ')"
                    >
                      <template #avatar>
                        <n-avatar :src="item?.thumb" :size="75"></n-avatar>
                      </template>
                      <template #header-extra>
                        <n-badge
                          v-if="item.user_data?.in_collection"
                          color="green"
                        >
                          <template #value>
                            <n-icon :component="Library16Filled" />
                          </template>
                        </n-badge>
                        <n-badge v-if="item.user_data?.in_wantlist">
                          <template #value>
                            <n-icon :component="Eye16Regular" />
                          </template>
                        </n-badge>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </n-scrollbar>
            </n-grid-item>
            <n-grid-item>
              <n-spin :show="searchingVersions">
                <n-h3>Version</n-h3>
              </n-spin>
              <n-scrollbar trigger="none" style="max-height: 75vh">
                <n-list hoverable clickable>
                  <n-list-item
                    v-for="item in versionItems"
                    :key="item.id"
                    class="release-item"
                    @click.prevent="handleReleaseClick(+item.id)"
                    :data-id="item.id"
                  >
                    <template #suffix>
                      <div v-if="item.selected">
                        <img src="@/assets/arrowRight.svg" height="44" />
                      </div>
                    </template>
                    <n-thing :title="item.title">
                      <template #avatar>
                        <n-avatar :src="item?.thumb" :size="75"></n-avatar>
                      </template>
                      <template #header-extra>
                        <n-badge
                          v-if="item.stats?.user.in_collection"
                          color="green"
                        >
                          <template #value>
                            <n-icon :component="Library16Filled" />
                          </template>
                        </n-badge>
                        <n-badge v-if="item.stats?.user.in_wantlist">
                          <template #value>
                            <n-icon :component="Eye16Regular" />
                          </template>
                        </n-badge>
                      </template>
                      <template #description>
                        {{ item.country }}, {{ item.label }}<br />
                        <code>{{ item.catno }}</code>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </n-scrollbar>
            </n-grid-item>
            <n-grid-item>
              <n-spin :show="searchingDetails">
                <n-h3>Details</n-h3>
              </n-spin>
              <div v-if="releaseDetails">
                <n-h2>
                  <a :href="releaseDetails.uri" target="_discogs_details">
                    {{ releaseDetails.artists_sort }}
                    -
                    {{ releaseDetails.title }}
                  </a>
                </n-h2>
                <img :src="releaseDetails.thumb" />
                <a
                  :href="
                    'https://www.discogs.com/master/' +
                    releaseDetails.master_id +
                    '?format=7%22'
                  "
                  target="_discogs_details"
                >
                  &nbsp; MASTER</a
                >

                <n-grid :cols="4">
                  <n-grid-item>
                    <n-statistic
                      label="Have / Want"
                      :value="releaseDetails.community.have"
                    >
                      <template #suffix>
                        / {{ releaseDetails.community.want }}
                      </template></n-statistic
                    >
                  </n-grid-item>
                  <n-grid-item>
                    <n-statistic
                      label="Lowest Price"
                      :value="releaseDetails.lowest_price"
                    >
                      <template #prefix> € </template></n-statistic
                    >
                  </n-grid-item>
                  <n-grid-item>
                    <n-statistic
                      label="For Sale"
                      :value="releaseDetails.num_for_sale"
                    ></n-statistic>
                  </n-grid-item>
                  <n-grid-item>
                    <n-statistic
                      label="Lowest Price"
                      :value="releaseDetails.lowest_price"
                    >
                      <template #prefix> € </template></n-statistic
                    >
                  </n-grid-item>
                </n-grid>
                {{ releaseDetails.notes }}
              </div>
              <n-h2 v-else>No Version selected</n-h2>
            </n-grid-item>
          </n-grid>
        </n-layout-content>
      </n-layout>
      <n-layout-footer
        bordered
        position="absolute"
        style="height: 88px; padding: 24px"
      >
        <p>
          Get your API token
          <a href="https://www.discogs.com/settings/developers">here</a>
        </p>

        <n-input
          v-model:value="apiToken"
          type="text"
          placeholder="API token"
          @keyup.enter="setApiToken"
        />
      </n-layout-footer>
    </n-layout>
  </div>
</template>

<style scoped>
.release-item:nth-child(even),
.master-item:nth-child(even) {
  background-color: #f1f1f1;
}
.selected {
  background-color: #f3d1a0 !important;
}
.in_collection {
  background-color: #06d483 !important;
}
.in_wantlist {
  background-color: #d40758 !important;
}
</style>
