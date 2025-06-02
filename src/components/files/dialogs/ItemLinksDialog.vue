<template>
  <q-card
    bordered
    style="width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Item Links</q-toolbar-title>
    </q-toolbar>
    <q-list
      bordered
      class="rounded-borders"
    >
      <q-expansion-item
        expand-separator
        default-opened
        label="Existing Links"
        header-class="text-weight-bolder text-body1 bg-blue text-white"
        expand-icon-class="text-white"
      >
        <q-list
          class="q-ml-sm q-mr-sm q-mb-md"
          style="max-height: 200px; overflow: scroll"
        >
          <q-card
            class="q-mt-md"
            flat
          >
            <q-item
              dense
              clickable
              @click="copyToClipboard(permanentLink)"
              class="bg-blue text-white"
            >
              <q-item-section class="q-pa-none">
                <q-item-label
                  class="ellipsis text-weight-bolder"
                  style="width: 165px"
                >
                  Permanent Link
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card>
          <div
            v-if="linkStore.loading"
            class="row justify-center q-mt-sm q-mb-sm"
          >
            <q-spinner size="1em" />
          </div>
          <div v-if="!linkStore.loading && linkStore.error">
            <div class="row justify-center text-body1 text-red q-mt-sm q-mb-sm q-ml-sm">
              Couldn't fetch links
            </div>
          </div>
          <div v-if="!linkStore.loading && !linkStore.error">
            <template
              v-for="shortLink in linkStore.shortLinks"
              :key="shortLink.id"
            >
              <q-card
                class="q-mt-sm"
                flat
              >
                <q-item
                  dense
                  clickable
                  @click="copyToClipboard(linkStore.getShortLinkUrl(shortLink.linkId))"
                  class="bg-layout-bg text-layout-text"
                >
                  <q-item-section class="q-pa-none">
                    <q-item-label
                      class="ellipsis"
                      style="width: 165px"
                    >
                      {{ shortLink.linkId }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      size="xs"
                      icon="delete"
                      round
                      unelevated
                      outline
                      class="bg-red text-white q-ml-sm"
                      @click.stop="handleDeleteShortLink(shortLink.id)"
                    />
                  </q-item-section>
                </q-item>
              </q-card>
            </template>
          </div>
        </q-list>
      </q-expansion-item>

      <q-expansion-item
        expand-separator
        header-class="text-weight-bolder text-body1 bg-cyan text-white"
        expand-icon-class="text-white"
        label="Create Short Link"
      >
        <div class="row justify-center q-ma-sm">
          <q-checkbox
            v-model="linkRandom"
            label="Random Link"
            color="green"
            class="text-body1"
          />
        </div>
        <div
          v-if="!linkRandom"
          class="q-ma-sm row justify-center"
        >
          <q-input
            :color="localStore.isDarkMode ? 'white' : 'black'"
            v-model="linkId"
            input-class="text-left"
            style="max-width: 300px"
            label="Link ID"
            class="text-body1 full-width"
            outlined
            no-error-icon
            hide-bottom-space
            dense
            :rules="[
              (val) => /^[a-z0-9]+$/i.test(val) || 'Only alphanumerical characters',
              (val) => (val.length > 0 && val.length < 25) || '0-25 characters',
            ]"
          />
        </div>
        <div class="row justify-center q-ma-sm">
          <q-btn
            label="Create Short Link"
            class="bg-cyan text-white"
            @click="handleCreateShortLink"
          />
        </div>
      </q-expansion-item>
    </q-list>

    <q-card-actions
      align="center"
      class="q-mt-sm q-mb-sm"
    >
      <q-btn
        v-close-popup
        push
        class="bg-green text-white col"
        icon="done"
        size="md"
        label="OK"
        style="max-width: 130px"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, onMounted, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { useLinkOperationsStore } from 'src/stores/fileStores/linkOperationsStore';
import type { FileNode } from 'src/types/apiTypes';

// Define props
const props = defineProps({
  propItem: {
    type: Object as PropType<FileNode>,
    required: true,
  },
});
// Setup stores
const localStore = useLocalStore();
const linkStore = useLinkOperationsStore();

// Local state
const item = computed(() => props.propItem);
const linkRandom = ref(true);
const linkId = ref('');

// Computed properties
const permanentLink = computed(() =>
  linkStore.getItemShareLink(item.value.nodeType, item.value.id),
);

// Handlers
async function handleCreateShortLink() {
  await linkStore.createShortLink(item.value.nodeType, item.value.id, {
    random: linkRandom.value,
    linkId: linkId.value,
  });

  // Reset form after creation
  if (!linkRandom.value) {
    linkId.value = '';
  }
}

async function handleDeleteShortLink(id: string) {
  await linkStore.deleteShortLink(id, item.value.nodeType, item.value.id);
}

// Lifecycle hooks
onMounted(async () => {
  await linkStore.getShortLinks(item.value.nodeType, item.value.id);
});
</script>
