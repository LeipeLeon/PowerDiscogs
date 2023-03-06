<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import type { MasterItem, Version } from "./interfaces";
import {
  NAvatar,
  NBadge,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NIcon,
  NInput,
  useMessage,
  NGrid,
  NGridItem,
  NH3,
  NSpin,
  NList,
  NListItem,
  NThing,
  NScrollbar,
  NSwitch,
  NRadio,
  NRadioGroup,
  NSpace,
} from "naive-ui";
import { Library16Filled, Eye16Regular } from "@vicons/fluent";
import { useWindowFocus } from "@vueuse/core";

const focused = useWindowFocus();
const message = useMessage();
const inputRef = ref();
const versionCount = ref(0);
const format = ref<string | null>('7"');
const formats = [
  { value: "", label: "All" },
  { value: '7"', label: '7"' },
  { value: '12"', label: '12"' },
  { value: "LP", label: "LP" },
];

const inputString = ref();
const filterString = ref("");
let searchType = ref("master");
let searchingMasters = ref(false);
let searchingVersions = ref(false);
let selectedMasterItemId = ref<number | null>(null);
let apiToken = ref<string | null>("");

const masterItems = ref<Array<MasterItem>>([
  { id: -1, title: "First do a search" },
]);
const versionItems = ref<Array<Version>>([]);
const filtered = ref<Array<Version>>([]);

const handleKeyUp = () => {
  searchMasterRelease();
};

const handleMasterClick = (id: number) => {
  if (searchType.value === "master") {
    selectedMasterItemId.value = +id;
    masterItems.value.forEach((masterItem) => {
      masterItem.selected = masterItem.id === selectedMasterItemId.value;
    });
    searchVersion();
  } else {
    handleReleaseClick(id);
  }
};

const handleReleaseClick = (id: number) => {
  const releaseUrl = "https://www.discogs.com/release/" + id;
  window.open(releaseUrl, "_discogs_details");
  // const selectedReleaseItemId = +id;
  // versionItems.value.forEach((versionItem) => {
  //   versionItem.selected = versionItem.id === selectedReleaseItemId;
  // });
  // searchReleases(selectedReleaseItemId);
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
    Accept: "application/vnd.discogs.v2.html+json",
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
    "https://api.discogs.com/database/search?format=Single&type=" +
    searchType.value +
    "&q=" +
    inputString.value;
  searchingMasters.value = true;
  versionItems.value = [];
  fetchData(fetchUrl)
    .then((data: any) => (masterItems.value = data.results))
    .finally(() => {
      searchingMasters.value = false;
    });
};

const preferredOrder = ["Germany", "Europe", "Netherlands"];

const searchVersion = () => {
  const fetchUrl = `https://api.discogs.com/masters/${selectedMasterItemId.value}/versions?per_page=100&format=${format.value}`;
  searchingVersions.value = true;
  versionCount.value = 0;
  versionItems.value = [];
  fetchData(fetchUrl)
    .then((data: any) => {
      versionCount.value = data.pagination.items;
      versionItems.value = data.versions
        .slice()
        .sort(function (a: Version, b: Version) {
          return (
            preferredOrder.indexOf(a.country) -
            preferredOrder.indexOf(b.country)
          );
        })
        .reverse();
    })
    .finally(() => {
      searchingVersions.value = false;
      filtered.value = versionItems.value;
    });
};

watch(focused, (isFocused: boolean) => {
  if (isFocused) {
    nextTick(() => {
      inputRef.value.focus();
    });
  }
});

const applyFilter = () => {
  let filter = filterString.value;
  console.log("filter.length", !filter.length);
  if (filter.length) {
    filtered.value = versionItems.value.filter(
      (version) =>
        version.country?.toLowerCase().includes(filter.toLowerCase()) ||
        version.label?.toLowerCase().includes(filter.toLowerCase()) ||
        version.format?.toLowerCase().includes(filter.toLowerCase()) ||
        version.catno?.toLowerCase().includes(filter.toLowerCase())
    );
  } else {
    filtered.value = versionItems.value;
  }
};
onMounted(() => {
  getApiToken();
});
</script>

<template>
  <div style="height: 100vh; position: relative">
    <n-layout position="absolute">
      <n-layout-content content-style="padding: 12px">
        <n-grid cols="2" x-gap="12">
          <n-grid-item>
            <n-spin :show="searchingMasters">
              <n-h3>
                <n-switch
                  checked-value="master"
                  unchecked-value="release"
                  v-model:value="searchType"
                  @update:value="searchMasterRelease"
                >
                  <template #checked>Master</template>
                  <template #unchecked>Release</template>
                </n-switch>
              </n-h3>
            </n-spin>
            <n-input
              v-model:value="inputString"
              ref="inputRef"
              type="text"
              placeholder="Search for artist / Title"
              autofocus
              @focus="$event.target?.select()"
              @keyup.enter="handleKeyUp"
            />
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
              <n-h3>
                {{ versionCount }} ({{ filtered.length }}) Versions
                <n-radio-group v-model:value="format" name="radiogroup">
                  <n-space>
                    <n-radio
                      v-for="format in formats"
                      :key="format.value"
                      :value="format.value"
                      :label="format.label"
                      :default-checked="format.defaultChecked"
                    />
                  </n-space>
                </n-radio-group>

                <a
                  style="float: right"
                  :href="
                    'https://www.discogs.com/master/' +
                    selectedMasterItemId +
                    '?format=7%22'
                  "
                  v-if="selectedMasterItemId"
                  target="_discogs_details"
                >
                  MASTER</a
                >
              </n-h3>
            </n-spin>
            <n-input
              v-model:value="filterString"
              ref="filterRef"
              type="text"
              placeholder="Search for artist / Title"
              @keyup="applyFilter"
            />

            <n-scrollbar trigger="none" style="max-height: 75vh">
              <n-list hoverable clickable>
                <n-list-item
                  v-for="(item, i) in filtered"
                  :key="i"
                  class="release-item"
                  @click.prevent="handleReleaseClick(+item.id)"
                  :data-id="i"
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
                    <!-- <n-statistic
                      label="Have / Want"
                      :value="item.stats?.community.in_collection"
                    >
                      <template #suffix>
                        / {{ item.stats?.community.in_wantlist }}
                      </template></n-statistic
                    > -->
                  </n-thing>
                </n-list-item>
              </n-list>
            </n-scrollbar>
          </n-grid-item>
          <!-- <n-grid-item>
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
              &nbsp;
              <a
                :href="
                  'https://www.discogs.com/master/' +
                  releaseDetails.master_id +
                  '?format=7%22'
                "
                target="_discogs_details"
              >
                MASTER</a
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
          </n-grid-item> -->
        </n-grid>
      </n-layout-content>
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
