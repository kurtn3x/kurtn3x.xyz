<!-- filepath: /home/kurtn3x/main/kurtn3x.xyz/src/components/files/UploadWindow.vue -->
<template>
  <q-page-sticky
    v-if="uploadStore.showProgressDialog && !localStore.isSmallWidth"
    position="bottom-right"
  >
    <q-card
      bordered
      style="width: 350px"
    >
      <q-card-section class="q-pa-none row">
        <div class="q-pa-sm">
          <q-icon
            name="cloud_upload"
            size="sm"
            class="q-ml-sm"
          />
          <a class="q-ml-md ellipsis text-h6">Upload Manager</a>
        </div>
        <q-space />
        <q-btn
          flat
          stretch
          size="sm"
          :icon="minimized ? 'expand_less' : 'expand_more'"
          @click="minimized = !minimized"
        />

        <q-btn
          size="sm"
          flat
          stretch
          icon="close"
          @click="uploadStore.toogleProgressDialog()"
          class="close"
        />
      </q-card-section>
      <div
        v-if="minimized && uploadStore.hasActiveUploads"
        class="q-mt-sm"
      >
        <q-linear-progress
          :value="uploadStore.totalUploadProgress / 100"
          color="white"
          track-color="rgba(255,255,255,0.3)"
          size="4px"
          rounded
        />
        <div class="text-caption q-mt-xs">
          {{ Math.round(uploadStore.totalUploadProgress) }}% • {{ activeCount }} active •
          {{ totalCount }} total
        </div>
      </div>

      <!-- Upload content -->
      <div v-if="!minimized">
        <!-- Upload List Component -->
        <q-separator :color="localStore.isDarkMode ? 'white' : 'dark'" />
        <div style="max-height: 200px; overflow-y: auto">
          <UploadList
            :uploads="allUploads"
            @cancel="handleCancel"
            @retry="handleRetry"
            @remove="handleRemove"
          />
        </div>

        <!-- Actions -->

        <q-card-actions
          v-if="allUploads.length > 0"
          align="right"
          class="q-pa-sm"
        >
          <q-space />
          <q-btn
            v-if="completedCount + failedCount > 0"
            @click="clearCompleted"
            label="Clear Completed"
            size="sm"
            flat
            class="bg-green text-white"
          />
          <q-btn
            v-if="activeCount > 0"
            @click="cancelAllActive"
            label="Cancel All Active"
            size="sm"
            flat
            class="bg-red text-white"
          />

          <q-btn
            @click="clearAll"
            label="Clear All"
            size="sm"
            flat
            class="bg-grey text-white"
          />
        </q-card-actions>
      </div>
    </q-card>
  </q-page-sticky>
  <q-dialog
    :model-value="uploadStore.showProgressDialog"
    v-if="localStore.isSmallWidth"
    maximized
  >
    <q-card
      bordered
      class="column"
    >
      <q-card-section class="q-pa-none row">
        <div class="q-pa-sm">
          <q-icon
            name="cloud_upload"
            size="sm"
            class="q-ml-sm"
          />
          <a class="q-ml-md ellipsis text-h6">Upload Manager</a>
        </div>
        <q-space />

        <q-btn
          size="sm"
          flat
          stretch
          icon="close"
          @click="uploadStore.toogleProgressDialog()"
          class="close"
        />
      </q-card-section>

      <!-- Upload content -->
      <!-- Upload List Component -->
      <q-separator :color="localStore.isDarkMode ? 'white' : 'dark'" />
      <div class="col column">
        <div class="col overflow-auto">
          <UploadList
            :uploads="allUploads"
            @cancel="handleCancel"
            @retry="handleRetry"
            @remove="handleRemove"
          />
        </div>

        <!-- Actions -->

        <q-card-actions
          v-if="allUploads.length > 0"
          align="right"
          class="q-pa-sm"
        >
          <q-separator :color="localStore.isDarkMode ? 'white' : 'dark'" />
          <q-space />
          <q-btn
            v-if="completedCount + failedCount > 0"
            @click="clearCompleted"
            label="Clear Completed"
            size="sm"
            flat
            class="bg-green text-white"
          />
          <q-btn
            v-if="activeCount > 0"
            @click="cancelAllActive"
            label="Cancel All Active"
            size="sm"
            flat
            class="bg-red text-white"
          />

          <q-btn
            @click="clearAll"
            label="Clear All"
            size="sm"
            flat
            class="bg-grey text-white"
          />
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';
import { useLocalStore } from 'src/stores/localStore';
import { uploadTypeUtils } from 'src/components/files/upload/helpers/uploadStatus';
import UploadList from './upload/UploadList.vue';
import type { AnyUploadProgressEntry } from 'src/types/localTypes';
import { UploadStatus } from 'src/types/localTypes';

// Store
const uploadStore = useUploadStore();
const localStore = useLocalStore();

// Local state
const minimized = ref(false);

// Computed properties
const allUploads = computed(() => [...uploadStore.uploadQueue, ...uploadStore.uploadProgressList]);

const activeCount = computed(
  () => allUploads.value.filter((u) => uploadTypeUtils.isActive(u)).length,
);

const completedCount = computed(
  () => allUploads.value.filter((u) => u.status === UploadStatus.COMPLETED).length,
);

const failedCount = computed(
  () => allUploads.value.filter((u) => u.status === UploadStatus.FAILED).length,
);

const totalCount = computed(() => allUploads.value.length);

// Action handlers (simplified - just pass through to store)
async function handleCancel(upload: AnyUploadProgressEntry): Promise<void> {
  await uploadStore.cancelUpload(upload.id);
}

async function handleRetry(upload: AnyUploadProgressEntry): Promise<void> {
  await uploadStore.retryUpload(upload.id);
}

function handleRemove(upload: AnyUploadProgressEntry): void {
  uploadStore.removeUploadById(upload.id);
}

// Bulk actions
async function cancelAllActive(): Promise<void> {
  const activeUploads = allUploads.value.filter(uploadTypeUtils.isActive);
  await Promise.all(activeUploads.map((upload) => uploadStore.cancelUpload(upload.id)));
}

function clearCompleted(): void {
  const completedUploads = allUploads.value.filter((u) =>
    [UploadStatus.COMPLETED, UploadStatus.FAILED, UploadStatus.CANCELED].includes(u.status),
  );
  completedUploads.forEach((upload) => uploadStore.removeUploadById(upload.id));
}

async function clearAll(): Promise<void> {
  await uploadStore.clearAllUploads();
}
</script>

<style scoped>
.upload-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-width: 90vw;
  max-height: 80vh;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.close:hover {
  background-color: rgba(255, 0, 0, 0.644);
}

@media (max-width: 600px) {
  .upload-window {
    width: 95vw;
    right: 2.5vw;
    bottom: 10px;
  }
}
</style>
