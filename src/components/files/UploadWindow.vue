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
            v-if="uploadStore.hasAnyActiveUploads"
            color="orange"
            class="q-ml-sm"
          >
            {{ activeUploadsCount }}
          </q-badge>
        </div>

        <div class="row q-gutter-xs">
          <!-- Overall progress -->
          <q-circular-progress
            v-if="uploadStore.hasAnyActiveUploads"
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
        v-if="minimized && uploadStore.hasAnyActiveUploads"
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
              {{ uploadStats.regular.total }}
            </div>
            <div class="text-caption">Regular</div>
          </div>
          <div class="col">
            <div class="text-h6 text-orange">
              {{ uploadStats.chunked.total }}
            </div>
            <div class="text-caption">Chunked</div>
          </div>
          <div class="col">
            <div class="text-h6 text-green">{{ totalCompleted }}</div>
            <div class="text-caption">Completed</div>
          </div>
          <div class="col">
            <div class="text-h6 text-red">{{ totalFailed }}</div>
            <div class="text-caption">Failed</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Tabs for different upload types -->
      <q-tabs
        v-model="activeTab"
        align="justify"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        narrow-indicator
      >
        <q-tab
          name="regular"
          label="Regular Uploads"
          :badge="uploadStore.uploadProgessList.length || undefined"
        />
        <q-tab
          name="chunked"
          label="Chunked Uploads"
          :badge="uploadStore.chunkedUploads.length || undefined"
        />
        <q-tab
          name="queue"
          label="Upload Queue"
          :badge="uploadStore.uploadList.length || undefined"
        />
      </q-tabs>

      <q-separator />

      <!-- Tab Panels -->
      <q-tab-panels
        v-model="activeTab"
        style="max-height: 400px; overflow: auto"
      >
        <!-- Regular Uploads -->
        <q-tab-panel
          name="regular"
          class="q-pa-none"
        >
          <div
            v-if="uploadStore.uploadProgessList.length === 0"
            class="text-center q-pa-md text-grey"
          >
            No regular uploads
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="(upload, index) in uploadStore.uploadProgessList"
              :key="`regular-${index}`"
              dense
            >
              <q-item-section avatar>
                <q-avatar
                  :color="upload.statusColor"
                  text-color="white"
                  size="sm"
                >
                  <q-icon :name="getRegularUploadIcon(upload.status)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="ellipsis">{{ upload.name }}</q-item-label>

                <!-- Progress bar -->
                <q-linear-progress
                  :value="upload.transferredPercent"
                  :color="getProgressColor(upload.status)"
                  class="q-mt-xs"
                  rounded
                  size="4px"
                />

                <!-- Status and size info -->
                <q-item-label
                  caption
                  class="row items-center justify-between"
                >
                  <span>{{ upload.transferred }} / {{ upload.size }}</span>
                  <span>{{ Math.round(upload.transferredPercent * 100) }}%</span>
                </q-item-label>

                <!-- Error message -->
                <q-item-label
                  v-if="upload.status === 'error' && upload.message"
                  caption
                  class="text-red"
                >
                  {{ upload.message }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  v-if="upload.status === 'loading'"
                  @click="uploadStore.cancelUpload(index)"
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

          <!-- Actions for regular uploads -->
          <q-card-actions
            v-if="uploadStore.uploadProgessList.length > 0"
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
              @click="uploadStore.clearAllUploads()"
              label="Clear All"
              size="sm"
              flat
              color="negative"
            />
          </q-card-actions>
        </q-tab-panel>

        <!-- Chunked Uploads -->
        <q-tab-panel
          name="chunked"
          class="q-pa-none"
        >
          <div
            v-if="uploadStore.chunkedUploads.length === 0"
            class="text-center q-pa-md text-grey"
          >
            No chunked uploads
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="upload in uploadStore.chunkedUploads"
              :key="`chunked-${upload.id}`"
              dense
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getChunkedUploadColor(upload.status)"
                  text-color="white"
                  size="sm"
                >
                  <q-icon :name="getChunkedUploadIcon(upload.status)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="ellipsis">{{ upload.name }}</q-item-label>

                <!-- Progress bar -->
                <q-linear-progress
                  :value="upload.uploadedBytes / upload.size"
                  :color="getChunkedUploadColor(upload.status)"
                  class="q-mt-xs"
                  rounded
                  size="4px"
                />

                <!-- Status and details -->
                <q-item-label
                  caption
                  class="row items-center justify-between"
                >
                  <span>{{ formatChunkedUploadStatus(upload) }}</span>
                  <span v-if="upload.uploadSpeed > 0">
                    {{ formatSpeed(upload.uploadSpeed) }}
                    <span v-if="upload.eta > 0">• {{ formatETA(upload.eta) }}</span>
                  </span>
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
                  <!-- Pause/Resume button -->
                  <q-btn
                    v-if="upload.status === UploadStatus.UPLOADING"
                    @click="uploadStore.pauseChunkedUpload(upload.id)"
                    icon="pause"
                    size="xs"
                    round
                    flat
                    dense
                    color="warning"
                  >
                    <q-tooltip>Pause</q-tooltip>
                  </q-btn>

                  <q-btn
                    v-else-if="upload.status === UploadStatus.PAUSED"
                    @click="uploadStore.resumeChunkedUpload(upload.id)"
                    icon="play_arrow"
                    size="xs"
                    round
                    flat
                    dense
                    color="positive"
                  >
                    <q-tooltip>Resume</q-tooltip>
                  </q-btn>

                  <!-- Retry button for failed uploads -->
                  <q-btn
                    v-if="upload.status === UploadStatus.FAILED"
                    @click="uploadStore.retryChunkedUpload(upload.id)"
                    icon="refresh"
                    size="xs"
                    round
                    flat
                    dense
                    color="primary"
                  >
                    <q-tooltip>Retry</q-tooltip>
                  </q-btn>

                  <!-- Cancel button -->
                  <q-btn
                    v-if="
                      [UploadStatus.UPLOADING, UploadStatus.PAUSED, UploadStatus.QUEUED].includes(
                        upload.status,
                      )
                    "
                    @click="uploadStore.cancelChunkedUpload(upload.id)"
                    icon="close"
                    size="xs"
                    round
                    flat
                    dense
                    color="negative"
                  >
                    <q-tooltip>Cancel</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Actions for chunked uploads -->
          <q-card-actions
            v-if="uploadStore.chunkedUploads.length > 0"
            align="right"
            class="q-pa-sm"
          >
            <q-btn
              @click="uploadStore.removeCompletedChunkedUploads()"
              label="Clear Completed"
              size="sm"
              flat
              color="primary"
            />
            <q-btn
              @click="uploadStore.clearAllChunkedUploads()"
              label="Clear All"
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
            v-if="uploadStore.uploadList.length === 0"
            class="text-center q-pa-md text-grey"
          >
            No files in upload queue
          </div>

          <q-list
            v-else
            separator
          >
            <q-item
              v-for="(item, index) in uploadStore.uploadList"
              :key="`queue-${index}`"
              dense
            >
              <q-item-section avatar>
                <q-icon
                  :name="item.type === 'file' ? 'description' : 'folder'"
                  :color="item.type === 'file' ? 'blue' : 'orange'"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="ellipsis">{{ item.name }}</q-item-label>
                <q-item-label caption>
                  {{
                    item.type === 'file' && item.content instanceof File
                      ? fileSizeDecimal(item.content.size)
                      : item.type
                  }}
                  <span
                    v-if="
                      item.type === 'file' &&
                      item.content instanceof File &&
                      item.content.size >= uploadStore.CHUNKED_UPLOAD_THRESHOLD
                    "
                    class="text-orange q-ml-sm"
                  >
                    (Chunked Upload)
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  @click="uploadStore.removeFromUploadList(index)"
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
            v-if="uploadStore.uploadList.length > 0"
            align="between"
            class="q-pa-sm"
          >
            <q-btn
              @click="uploadStore.clearUploadList()"
              label="Clear Queue"
              size="sm"
              flat
              color="negative"
            />
            <q-btn
              @click="uploadStore.startUploadFromDialog()"
              label="Start Upload"
              size="sm"
              color="primary"
              :loading="uploadStore.uploadInProgress"
              :disable="uploadStore.uploadInProgress"
            />
          </q-card-actions>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';
import { fileSizeDecimal } from 'src/components/lib/functions';
import { UploadStatus } from 'src/types/localTypes';

// Store
const uploadStore = useUploadStore();

// Local state
const minimized = ref(false);
const activeTab = ref('regular');

let refreshInterval: ReturnType<typeof setInterval> | null = null;

// Start refresh interval when component mounts
watchEffect(() => {
  // Only start interval if there are active chunked uploads
  if (uploadStore.hasActiveChunkedUploads) {
    if (!refreshInterval) {
      refreshInterval = setInterval(() => {
        uploadStore.refreshChunkedUploadsList();
      }, 500); // Update every 500ms for smooth progress
    }
  } else {
    // Clear interval when no active uploads
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Computed properties
const uploadStats = computed(() => uploadStore.getUploadStats());

const activeUploadsCount = computed(() => {
  return uploadStats.value.regular.active + uploadStats.value.chunked.active;
});

const totalCompleted = computed(() => {
  return uploadStats.value.regular.completed + uploadStats.value.chunked.completed;
});

const totalFailed = computed(() => {
  return uploadStats.value.regular.failed + uploadStats.value.chunked.failed;
});

// Methods
function closeWindow() {
  if (uploadStore.hasAnyActiveUploads) {
    minimized.value = true;
  } else {
    uploadStore.showChunkedProgress = false;
  }
}

function getRegularUploadIcon(status: string): string {
  switch (status) {
    case 'loading':
      return 'cloud_upload';
    case 'ok':
      return 'check_circle';
    case 'error':
      return 'error';
    default:
      return 'description';
  }
}

function getProgressColor(status: string): string {
  switch (status) {
    case 'loading':
      return 'primary';
    case 'ok':
      return 'positive';
    case 'error':
      return 'negative';
    default:
      return 'grey';
  }
}

function getChunkedUploadIcon(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.UPLOADING:
      return 'cloud_upload';
    case UploadStatus.COMPLETED:
      return 'check_circle';
    case UploadStatus.FAILED:
      return 'error';
    case UploadStatus.PAUSED:
      return 'pause_circle';
    case UploadStatus.QUEUED:
      return 'schedule';
    case UploadStatus.PREPARING:
      return 'hourglass_empty';
    case UploadStatus.CANCELED:
      return 'cancel';
    default:
      return 'help';
  }
}

function getChunkedUploadColor(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.UPLOADING:
      return 'primary';
    case UploadStatus.COMPLETED:
      return 'positive';
    case UploadStatus.FAILED:
      return 'negative';
    case UploadStatus.PAUSED:
      return 'warning';
    case UploadStatus.QUEUED:
      return 'info';
    case UploadStatus.PREPARING:
      return 'grey';
    case UploadStatus.CANCELED:
      return 'grey';
    default:
      return 'grey';
  }
}

function formatChunkedUploadStatus(upload: any): string {
  const percentage = Math.round((upload.uploadedBytes / upload.size) * 100);
  const uploaded = fileSizeDecimal(upload.uploadedBytes);
  const total = fileSizeDecimal(upload.size);

  switch (upload.status) {
    case UploadStatus.UPLOADING:
      return `${percentage}% • ${uploaded} / ${total}`;
    case UploadStatus.COMPLETED:
      return 'Completed';
    case UploadStatus.FAILED:
      return 'Failed';
    case UploadStatus.PAUSED:
      return `Paused • ${percentage}% • ${uploaded} / ${total}`;
    case UploadStatus.QUEUED:
      return 'Queued';
    case UploadStatus.PREPARING:
      return 'Preparing...';
    case UploadStatus.CANCELED:
      return 'Canceled';
    default:
      return 'Unknown status';
  }
}

function formatSpeed(bytesPerSecond: number): string {
  return `${fileSizeDecimal(bytesPerSecond)}/s`;
}

function formatETA(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
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
