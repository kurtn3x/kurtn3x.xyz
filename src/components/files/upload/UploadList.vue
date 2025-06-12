<!-- filepath: /home/kurtn3x/main/kurtn3x.xyz/src/components/files/upload/UploadList.vue -->
<template>
  <div
    v-if="uploads.length === 0"
    class="text-center q-pa-md text-grey"
  >
    No uploads
  </div>

  <q-list
    v-else
    separator
  >
    <q-item
      v-for="upload in uploads"
      :key="upload.id"
      dense
    >
      <q-item-section
        avatar
        class="q-pr-xs"
      >
        <q-avatar
          :color="getUploadColor(upload.status)"
          text-color="white"
          size="sm"
        >
          <q-icon :name="getUploadIcon(upload)" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label
          v-if="isFolderUpload(upload) && upload.nodes.length > 0"
          caption
          class="text-purple"
        ></q-item-label>
        <q-item-label class="ellipsis">
          {{ upload.name }}
          <q-chip
            v-if="getUploadTypeLabel(upload)"
            :label="getUploadTypeLabel(upload)"
            size="sm"
            dense
            class="q-ml-sm"
            :color="getUploadTypeColor(upload)"
          />
        </q-item-label>

        <!-- Progress bar for active uploads -->
        <q-linear-progress
          v-if="isActiveUpload(upload)"
          :value="getUploadProgress(upload)"
          :color="getUploadColor(upload.status)"
          class="q-mt-xs"
          rounded
          size="4px"
        />

        <!-- Upload details -->
        <q-item-label caption>
          <div class="row items-center justify-between">
            <span>
              <a :class="`text-${getUploadColor(upload.status)}`">{{ upload.status }}</a>
              •
              <template v-if="isActiveUpload(upload)">
                {{ formatUploadProgress(upload) }}
              </template>
              <template v-else>
                {{ fileSizeDecimal(upload.sizeBytes) }}
              </template>
            </span>
            <span v-if="isActiveUpload(upload)">
              {{ Math.round(getUploadProgress(upload) * 100) }}%
            </span>
          </div>
        </q-item-label>

        <!-- Error message -->
        <q-item-label
          v-if="upload.status === UploadStatus.FAILED && upload.message"
          caption
          class="text-negative"
        >
          {{ upload.message }}
        </q-item-label>
      </q-item-section>

      <!-- Action buttons -->
      <q-item-section side>
        <div class="row q-gutter-xs">
          <!-- Cancel button -->
          <q-btn
            v-if="canCancel(upload)"
            @click="$emit('cancel', upload)"
            icon="close"
            size="xs"
            round
            flat
            dense
            color="negative"
          >
            <q-tooltip>Cancel</q-tooltip>
          </q-btn>

          <!-- Retry button -->
          <q-btn
            v-if="canRetry(upload)"
            @click="$emit('retry', upload)"
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
            v-if="canRemove(upload)"
            @click="$emit('remove', upload)"
            icon="delete"
            size="xs"
            round
            flat
            dense
            color="grey"
          >
            <q-tooltip>Remove</q-tooltip>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { uploadTypeUtils } from 'src/components/files/upload/helpers/uploadStatus';
import { fileSizeDecimal } from 'src/components/lib/functions';
import type { AnyUploadProgressEntry } from 'src/types/localTypes';
import { UploadStatus, isChunkedUpload, isFolderUpload } from 'src/types/localTypes';

// Props
interface Props {
  uploads: AnyUploadProgressEntry[];
}

defineProps<Props>();

// Emits
interface Emits {
  cancel: [upload: AnyUploadProgressEntry];
  retry: [upload: AnyUploadProgressEntry];
  remove: [upload: AnyUploadProgressEntry];
}

defineEmits<Emits>();

// Helper functions (moved from parent component)
function getUploadIcon(upload: AnyUploadProgressEntry): string {
  if (isFolderUpload(upload)) {
    switch (upload.status) {
      case UploadStatus.UPLOADING:
        return 'folder_open';
      case UploadStatus.COMPLETED:
        return 'folder_zip';
      case UploadStatus.FAILED:
        return 'folder_off';
      default:
        return 'folder';
    }
  }

  switch (upload.status) {
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
      return 'insert_drive_file';
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
      return 'orange';
    case UploadStatus.QUEUED:
      return 'info';
    case UploadStatus.CANCELED:
      return 'grey';
    default:
      return 'grey';
  }
}

function getUploadTypeLabel(upload: AnyUploadProgressEntry): string {
  if (isFolderUpload(upload)) return `Folder (${upload.nodes.length} Entries)`;
  if (isChunkedUpload(upload)) return 'Chunked';
  return '';
}

function getUploadTypeColor(upload: AnyUploadProgressEntry): string {
  if (isFolderUpload(upload)) return 'purple';
  if (isChunkedUpload(upload)) return 'orange';
  return 'grey';
}

function isActiveUpload(upload: AnyUploadProgressEntry): boolean {
  return uploadTypeUtils.isActive(upload);
}

function getUploadProgress(upload: AnyUploadProgressEntry): number {
  if (upload.sizeBytes === 0) return 0;
  return Math.min(1, upload.uploadedBytes / upload.sizeBytes);
}

function formatUploadProgress(upload: AnyUploadProgressEntry): string {
  const uploaded = fileSizeDecimal(upload.uploadedBytes);
  const total = fileSizeDecimal(upload.sizeBytes);
  return `${uploaded} / ${total}`;
}

// Action button visibility
function canCancel(upload: AnyUploadProgressEntry): boolean {
  return uploadTypeUtils.isCancelable(upload);
}

function canRetry(upload: AnyUploadProgressEntry): boolean {
  return uploadTypeUtils.isRetryable(upload);
}

function canRemove(upload: AnyUploadProgressEntry): boolean {
  return [UploadStatus.COMPLETED, UploadStatus.FAILED, UploadStatus.CANCELED].includes(
    upload.status,
  );
}
</script>

<style scoped>
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Reduce avatar section padding */
:deep(.q-item__section--avatar) {
  padding-right: 12px;
  min-width: auto;
}
</style>
