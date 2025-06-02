<template>
  <q-card
    bordered
    style="width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">{{ propItem.name }}</q-toolbar-title>
      <q-tooltip class="text-body1 bg-layout-bg text-layout-text">
        {{ propItem.name }}
      </q-tooltip>
    </q-toolbar>
    <div class="q-ma-md">
      <div>
        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Type</div>
          <div class="col q-ml-sm">{{ propItem.nodeType }}</div>
        </div>

        <div v-if="propItem.nodeType != 'folder'">
          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Mime</div>
            <div
              class="col q-ml-sm"
              style="line-break: anywhere"
            >
              {{ propItem.mimeType }}
            </div>
          </div>

          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Size</div>
            <div class="col q-ml-sm">
              {{ propItem.displaySize }}
            </div>
          </div>
        </div>

        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Created</div>
          <div class="col q-ml-sm">{{ propItem.created }}</div>
        </div>

        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Modified</div>
          <div class="col q-ml-sm">{{ propItem.modified }}</div>
        </div>

        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Folder</div>
          <div
            class="col q-ml-sm"
            style="line-break: anywhere"
          >
            {{ propItem.displayPath }}
          </div>
        </div>

        <div
          class="text-body1 q-mt-md row"
          v-if="propItem.isShared == false"
        >
          <div class="text-weight-bolder col-3">Shared</div>
          <div class="col q-ml-sm">{{ propItem.isShared }}</div>
        </div>
        <q-card
          class="q-mt-md"
          bordered
          flat
          v-if="propItem.isShared == true"
        >
          <q-expansion-item
            icon="shared"
            label="Shared"
            header-class="text-weight-bolder text-body1 bg-blue text-white"
            expand-icon-class="text-white"
          >
            <q-separator />
            <div class="text-body1 q-mt-md row q-ml-sm">
              <div class="text-weight-bolder">Allow Read</div>
              <div class="q-ml-md">
                {{ propItem.allowPublicRead }}
              </div>
            </div>
            <div class="text-body1 q-mt-md row q-ml-sm">
              <div class="text-weight-bolder text-weight-bolder">Allow Write</div>
              <div class="q-ml-md">
                {{ propItem.allowPublicWrite }}
              </div>
            </div>
            <div
              class="text-body1 q-mt-md row q-ml-sm"
              v-if="propItem.owner"
            >
              <div class="text-weight-bolder text-weight-bolder">Owner</div>
              <router-link
                :to="'/user/' + propItem.owner"
                class="q-ml-md text-blue"
              >
                {{ propItem.owner }}
              </router-link>
            </div>
            <div class="text-body1 q-mt-md row q-ml-sm q-mb-sm">
              <div class="text-weight-bolder text-weight-bolder">Password Protected</div>
              <div class="q-ml-md">
                {{ propItem.isPasswordProtected }}
              </div>
            </div>
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <q-separator class="q-mt-sm" />

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
import type { FileNode } from 'src/types/apiTypes';

defineProps({
  propItem: {
    type: Object as PropType<FileNode>,
    required: true,
  },
});
</script>
