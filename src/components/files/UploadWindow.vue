<template>
  <q-card
    class="upload-window"
    bordered
  >
    <!-- Header -->
    <q-card-section class="q-pa-sm bg-primary text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 row items-center">
          <q-icon
            name="cloud_upload"
            class="q-mr-sm"
          />
          Upload Manager
          <q-badge
            v-if="uploadStore.hasActiveUploads"
            color="orange"
            class="q-ml-sm"
          >
            {{ activeUploadsCount }}
          </q-badge>
        </div>

        <div class="row q-gutter-xs">
          <!-- Overall progress -->
          <q-circular-progress
            v-if="uploadStore.hasActiveUploads"
            :value="uploadStore.totalUploadProgress"
            size="30px"
            :thickness="0.3"
            color="white"
            track-color="rgba(255,255,255,0.3)"
            class="q-mr-sm"
          />

          <!-- Toggle minimize -->
          <q-btn
            @click="minimized = !minimized"
            :icon="minimized ? 'expand_less' : 'expand_more'"
            size="sm"
            flat
            round
            dense
          />

          <!-- Close button -->
          <q-btn
            @click="closeWindow"
            icon="close"
            size="sm"
            flat
            round
            dense
          />
        </div>
      </div>

      <!-- Overall progress bar when minimized -->
      <div
        v-if="minimized && uploadStore.hasActiveUploads"
        class="q-mt-sm"
      >
        <q-linear-progress
          :value="uploadStore.totalUploadProgress"
          color="white"
          track-color="rgba(255,255,255,0.3)"
          size="4px"
          rounded
        />
        <div class="text-caption q-mt-xs">
          {{ Math.round(uploadStore.totalUploadProgress * 100) }}% • {{ activeUploadsCount }} active
          uploads
        </div>
      </div>
    </q-card-section>

    <!-- Upload content (hidden when minimized) -->
    <div v-if="!minimized">
      <!-- Upload Statistics -->
      <q-card-section class="q-pa-sm bg-grey-1">
        <div class="row q-gutter-md text-center">
          <div class="col">
            <div class="text-h6 text-primary">
              {{ uploadStats.queued }}
            </div>
            <div class="text-caption">Queued</div>
          </div>
          <div class="col">
            <div class="text-h6 text-orange">
              {{ uploadStats.active }}
            </div>
            <div class="text-caption">Active</div>
          </div>
          <div class="col">
            <div class="text-h6 text-green">{{ uploadStats.completed }}</div>
            <div class="text-caption">Completed</div>
          </div>
          <div class="col">
            <div class="text-h6 text-red">{{ uploadStats.failed }}</div>
            <div class="text-caption">Failed</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Tabs for different upload states -->
      <q-tabs
        v-model="activeTab"
        align="justify"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab
          name="active"
          label="Active Uploads"
          :badge="activeAndPreparingUploads.length || undefined"
        />
        <q-tab
          name="queue"
          label="Upload Queue"
          :badge="uploadStore.queuedUploads.length || undefined"
        />
        <q-tab
          name="completed"
          label="Completed"
          :badge="completedAndFailedUploads.length || undefined"
        />
      </q-tabs>

      <q-separator />

      <!-- Tab Panels -->
      <q-tab-panels
        v-model="activeTab"
        style="max-height: 400px; overflow: auto"
      >
        <!-- Active Uploads -->
        <q-tab-panel
          name="active"
          class="q-pa-none"
        >
          <div
            v-if="activeAndPreparingUploads.length === 0"
            class="text-center q-pa-md text-grey"
          >
            No active uploads
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="upload in activeAndPreparingUploads"
              :key="`active-${upload.id}`"
              dense
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getUploadColor(upload.status)"
                  text-color="white"
                  size="sm"
                >
                  <q-icon :name="getUploadIcon(upload.status)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="ellipsis">
                  {{ upload.name }}
                  <span
                    v-if="upload.sizeBytes >= uploadStore.CHUNKED_UPLOAD_THRESHOLD"
                    class="text-orange q-ml-sm text-caption"
                  >
                    (Chunked)
                  </span>
                </q-item-label>

                <!-- Progress bar -->
                <q-linear-progress
                  :value="getUploadProgress(upload)"
                  :color="getUploadColor(upload.status)"
                  class="q-mt-xs"
                  rounded
                  size="4px"
                />

                <!-- Status and size info -->
                <q-item-label
                  caption
                  class="row items-center justify-between"
                >
                  <span>{{ formatUploadProgress(upload) }}</span>
                  <span>{{ Math.round(getUploadProgress(upload) * 100) }}%</span>
                </q-item-label>

                <!-- Upload speed -->
                <q-item-label
                  v-if="upload.uploadSpeed > 0"
                  caption
                  class="text-blue"
                >
                  {{ formatSpeed(upload.uploadSpeed) }}
                </q-item-label>

                <!-- Error message -->
                <q-item-label
                  v-if="upload.status === UploadStatus.FAILED && upload.message"
                  caption
                  class="text-red"
                >
                  {{ upload.message }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  v-if="[UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status)"
                  @click="uploadStore.cancelUpload(upload.id)"
                  icon="close"
                  size="xs"
                  round
                  flat
                  dense
                  color="negative"
                >
                  <q-tooltip>Cancel</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Actions for active uploads -->
          <q-card-actions
            v-if="activeAndPreparingUploads.length > 0"
            align="right"
            class="q-pa-sm"
          >
            <q-btn
              @click="cancelAllActiveUploads"
              label="Cancel All"
              size="sm"
              flat
              color="negative"
            />
          </q-card-actions>
        </q-tab-panel>

        <!-- Upload Queue -->
        <q-tab-panel
          name="queue"
          class="q-pa-none"
        >
          <div
            v-if="uploadStore.queuedUploads.length === 0"
            class="text-center q-pa-md text-grey"
          >
            No files in upload queue
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="upload in uploadStore.queuedUploads"
              :key="`queue-${upload.id}`"
              dense
            >
              <q-item-section avatar>
                <q-icon
                  name="schedule"
                  color="info"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="ellipsis">
                  {{ upload.name }}
                  <span
                    v-if="upload.sizeBytes >= uploadStore.CHUNKED_UPLOAD_THRESHOLD"
                    class="text-orange q-ml-sm text-caption"
                  >
                    (Chunked Upload)
                  </span>
                </q-item-label>
                <q-item-label caption>
                  {{ fileSizeDecimal(upload.sizeBytes) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  @click="uploadStore.cancelUpload(upload.id)"
                  icon="close"
                  size="xs"
                  round
                  flat
                  dense
                  color="negative"
                >
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Actions for upload queue -->
          <q-card-actions
            v-if="uploadStore.queuedUploads.length > 0"
            align="right"
            class="q-pa-sm"
          >
            <q-btn
              @click="clearQueuedUploads"
              label="Clear Queue"
              size="sm"
              flat
              color="negative"
            />
          </q-card-actions>
        </q-tab-panel>

        <!-- Completed & Failed Uploads -->
        <q-tab-panel
          name="completed"
          class="q-pa-none"
        >
          <div
            v-if="completedAndFailedUploads.length === 0"
            class="text-center q-pa-md text-grey"
          >
            No completed uploads
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="upload in completedAndFailedUploads"
              :key="`completed-${upload.id}`"
              dense
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getUploadColor(upload.status)"
                  text-color="white"
                  size="sm"
                >
                  <q-icon :name="getUploadIcon(upload.status)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="ellipsis">
                  {{ upload.name }}
                  <span
                    v-if="upload.sizeBytes >= uploadStore.CHUNKED_UPLOAD_THRESHOLD"
                    class="text-orange q-ml-sm text-caption"
                  >
                    (Chunked)
                  </span>
                </q-item-label>

                <q-item-label caption>
                  {{ fileSizeDecimal(upload.sizeBytes) }} • {{ upload.status }}
                </q-item-label>

                <!-- Error message -->
                <q-item-label
                  v-if="upload.status === UploadStatus.FAILED && upload.message"
                  caption
                  class="text-red"
                >
                  {{ upload.message }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <!-- Retry button for failed uploads -->
                  <q-btn
                    v-if="upload.status === UploadStatus.FAILED && isChunkedUpload(upload)"
                    @click="uploadStore.retryUpload(upload.id)"
                    icon="refresh"
                    size="xs"
                    round
                    flat
                    dense
                    color="primary"
                  >
                    <q-tooltip>Retry</q-tooltip>
                  </q-btn>

                  <!-- Remove button -->
                  <q-btn
                    @click="removeUpload(upload.id)"
                    icon="delete"
                    size="xs"
                    round
                    flat
                    dense
                    color="negative"
                  >
                    <q-tooltip>Remove</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Actions for completed uploads -->
          <q-card-actions
            v-if="completedAndFailedUploads.length > 0"
            align="right"
            class="q-pa-sm"
          >
            <q-btn
              @click="uploadStore.clearCompletedUploads()"
              label="Clear Completed"
              size="sm"
              flat
              color="primary"
            />
            <q-btn
              @click="clearAllCompletedAndFailed"
              label="Clear All"
              size="sm"
              flat
              color="negative"
            />
          </q-card-actions>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';
import { fileSizeDecimal } from 'src/components/lib/functions';
import type { ChunkedUploadProgressEntry, RegularUploadProgressEntry } from 'src/types/localTypes';
import { UploadStatus, isChunkedUpload } from 'src/types/localTypes';

// Store
const uploadStore = useUploadStore();

// Local state
const minimized = ref(false);
const activeTab = ref('active');

// Computed properties
const uploadStats = computed(() => uploadStore.getUploadStats());

const activeUploadsCount = computed(() => uploadStats.value.active);

const activeAndPreparingUploads = computed(() =>
  uploadStore.uploadProgressList.filter((upload) =>
    [UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status),
  ),
);

const completedAndFailedUploads = computed(() =>
  uploadStore.uploadProgressList.filter((upload) =>
    [UploadStatus.COMPLETED, UploadStatus.FAILED, UploadStatus.CANCELED].includes(upload.status),
  ),
);

// Methods
function closeWindow() {
  if (uploadStore.hasActiveUploads) {
    minimized.value = true;
  } else {
    uploadStore.showProgressDialog = false;
  }
}

function getUploadIcon(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.UPLOADING:
      return 'cloud_upload';
    case UploadStatus.COMPLETED:
      return 'check_circle';
    case UploadStatus.FAILED:
      return 'error';
    case UploadStatus.PREPARING:
      return 'hourglass_empty';
    case UploadStatus.QUEUED:
      return 'schedule';
    case UploadStatus.CANCELED:
      return 'cancel';
    default:
      return 'help';
  }
}

function getUploadColor(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.UPLOADING:
      return 'primary';
    case UploadStatus.COMPLETED:
      return 'positive';
    case UploadStatus.FAILED:
      return 'negative';
    case UploadStatus.PREPARING:
      return 'grey';
    case UploadStatus.QUEUED:
      return 'info';
    case UploadStatus.CANCELED:
      return 'grey';
    default:
      return 'grey';
  }
}

function getUploadProgress(
  upload: RegularUploadProgressEntry | ChunkedUploadProgressEntry,
): number {
  if (upload.sizeBytes === 0) return 0;
  return upload.uploadedBytes / upload.sizeBytes;
}

function formatUploadProgress(
  upload: RegularUploadProgressEntry | ChunkedUploadProgressEntry,
): string {
  const uploaded = fileSizeDecimal(upload.uploadedBytes);
  const total = fileSizeDecimal(upload.sizeBytes);
  return `${uploaded} / ${total}`;
}

function formatSpeed(bytesPerSecond: number): string {
  return `${fileSizeDecimal(bytesPerSecond)}/s`;
}

function cancelAllActiveUploads(): void {
  activeAndPreparingUploads.value.forEach((upload) => {
    uploadStore.cancelUpload(upload.id);
  });
}

function clearQueuedUploads(): void {
  uploadStore.queuedUploads.forEach((upload) => {
    uploadStore.cancelUpload(upload.id);
  });
}

function clearAllCompletedAndFailed(): void {
  const toRemove = completedAndFailedUploads.value.map((upload) => upload.id);
  toRemove.forEach((id) => removeUpload(id));
}

function removeUpload(uploadId: string): void {
  const index = uploadStore.uploadProgressList.findIndex((upload) => upload.id === uploadId);
  if (index !== -1) {
    uploadStore.uploadProgressList.splice(index, 1);
  }
}
</script>

<style scoped>
.upload-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 450px;
  max-width: 90vw;
  max-height: 80vh;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .upload-window {
    width: 95vw;
    right: 2.5vw;
    bottom: 10px;
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
