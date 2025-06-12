<!-- filepath: /src/components/files/upload/__tests__/UploadWindowTestbed.vue -->
<template>
  <div class="upload-testbed q-pa-md">
    <!-- Test Controls -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Upload Window Test Controls</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md q-mb-md">
          <q-btn
            @click="generateMockUploads"
            color="primary"
            icon="add"
          >
            Add Mock Uploads
          </q-btn>
          <q-btn
            @click="startUploadSimulation"
            color="positive"
            icon="play_arrow"
          >
            Start Progress Simulation
          </q-btn>
          <q-btn
            @click="pauseAllSimulations"
            color="warning"
            icon="pause"
          >
            Pause All
          </q-btn>
          <q-btn
            @click="uploadStore.toogleProgressDialog()"
            color="secondary"
            icon="launch"
          >
            Show Upload Window
          </q-btn>
          <q-btn
            @click="resetAll"
            color="negative"
            icon="refresh"
          >
            Reset All
          </q-btn>
        </div>

        <div class="row q-gutter-md q-mb-md">
          <q-input
            v-model.number="uploadCount"
            type="number"
            label="Number of uploads"
            style="width: 150px"
            min="1"
            max="20"
          />
          <q-input
            v-model.number="simulationDuration"
            type="number"
            label="Duration (seconds)"
            style="width: 150px"
            min="5"
            max="120"
          />
          <q-toggle
            v-model="includeErrors"
            label="Include errors"
          />
          <q-toggle
            v-model="includeFolders"
            label="Include folders"
          />
        </div>

        <div class="row q-gutter-md">
          <q-select
            v-model="uploadTypes"
            :options="uploadTypeOptions"
            label="Upload Types"
            multiple
            style="width: 200px"
          />
          <q-select
            v-model="testScenario"
            :options="scenarioOptions"
            label="Test Scenario"
            style="width: 200px"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Upload Store State Display -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Current Upload Store State</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md text-center">
          <div class="col bg-blue-1 q-pa-sm rounded-borders">
            <div class="text-h6 text-primary">{{ uploadStore.uploadQueue.length }}</div>
            <div class="text-caption">Queued</div>
          </div>
          <div class="col bg-orange-1 q-pa-sm rounded-borders">
            <div class="text-h6 text-orange">{{ uploadStore.activeUploads.length }}</div>
            <div class="text-caption">Active</div>
          </div>
          <div class="col bg-green-1 q-pa-sm rounded-borders">
            <div class="text-h6 text-positive">{{ uploadStore.completedUploads.length }}</div>
            <div class="text-caption">Completed</div>
          </div>
          <div class="col bg-red-1 q-pa-sm rounded-borders">
            <div class="text-h6 text-negative">{{ uploadStore.failedUploads.length }}</div>
            <div class="text-caption">Failed</div>
          </div>
          <div class="col bg-grey-3 q-pa-sm rounded-borders">
            <div class="text-h6">{{ Math.round(uploadStore.totalUploadProgress) }}%</div>
            <div class="text-caption">Overall Progress</div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <div class="text-subtitle2 q-mb-sm">Store Properties:</div>
        <div class="row q-gutter-md text-caption">
          <div>hasUploads: {{ uploadStore.hasUploads }}</div>
          <div>hasActiveUploads: {{ uploadStore.hasActiveUploads }}</div>
          <div>uploadInProgress: {{ uploadStore.uploadInProgress }}</div>
          <div>showProgressDialog: {{ uploadStore.showProgressDialog }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Upload List Preview -->
    <q-card v-if="allUploads.length > 0">
      <q-card-section>
        <div class="text-h6">Current Uploads ({{ allUploads.length }})</div>
      </q-card-section>

      <q-card-section style="max-height: 300px; overflow: auto">
        <q-list separator>
          <q-item
            v-for="upload in allUploads"
            :key="upload.id"
            dense
          >
            <q-item-section avatar>
              <q-avatar
                :color="getStatusColor(upload.status)"
                text-color="white"
                size="sm"
              >
                <q-icon :name="getStatusIcon(upload.status)" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ upload.name }}</q-item-label>
              <q-item-label caption>
                {{ upload.status }} • {{ formatFileSize(upload.sizeBytes) }}
                <span v-if="upload.uploadedBytes > 0">
                  • {{ Math.round((upload.uploadedBytes / upload.sizeBytes) * 100) }}%
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  @click="toggleUploadStatus(upload)"
                  size="xs"
                  round
                  flat
                  :icon="getToggleIcon(upload)"
                  :color="getToggleColor(upload)"
                />
                <q-btn
                  @click="removeUpload(upload)"
                  size="xs"
                  round
                  flat
                  icon="delete"
                  color="negative"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- The actual UploadWindow component -->
    <UploadWindow v-if="uploadStore.showProgressDialog" />
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';
import UploadWindow from 'src/components/files/UploadWindow.vue';
import type { AnyUploadProgressEntry } from 'src/types/localTypes';
import { UploadStatus } from 'src/types/localTypes';

// Store
const uploadStore = useUploadStore();

// Test configuration
const uploadCount = ref(5);
const simulationDuration = ref(15);
const includeErrors = ref(true);
const includeFolders = ref(true);
const uploadTypes = ref(['regular', 'chunked', 'folder']);
const testScenario = ref('mixed');

// Options
const uploadTypeOptions = [
  { label: 'Regular Files', value: 'regular' },
  { label: 'Chunked Files', value: 'chunked' },
  { label: 'Folders', value: 'folder' },
];

const scenarioOptions = [
  { label: 'Mixed Uploads', value: 'mixed' },
  { label: 'All Success', value: 'success' },
  { label: 'Some Failures', value: 'failures' },
  { label: 'Progressive Speed', value: 'progressive' },
  { label: 'Stress Test', value: 'stress' },
];

// Simulators tracking
const activeSimulators = new Map<string, NodeJS.Timeout>();

// Computed
const allUploads = computed(() => [...uploadStore.uploadQueue, ...uploadStore.uploadProgressList]);

// Mock upload generation
function generateMockUploads() {
  const uploads: AnyUploadProgressEntry[] = [];

  for (let i = 0; i < uploadCount.value; i++) {
    const upload = createMockUpload(i);
    uploads.push(upload);
  }

  // Add to store based on scenario
  if (testScenario.value === 'stress') {
    // Add all to queue for stress testing
    uploadStore.uploadQueue.push(...uploads);
  } else {
    // Mix between queue and progress
    const queueCount = Math.ceil(uploads.length * 0.7);
    uploadStore.uploadQueue.push(...uploads.slice(0, queueCount));
    uploadStore.uploadProgressList.push(...uploads.slice(queueCount));
  }
}

function createMockUpload(index: number): AnyUploadProgressEntry {
  const fileTypes = ['txt', 'jpg', 'png', 'pdf', 'mp4', 'zip', 'doc'];
  const fileType = fileTypes[index % fileTypes.length];

  // Determine upload type based on settings - using string types instead
  let uploadType = 'regular';
  if (uploadTypes.value.includes('chunked') && Math.random() < 0.3) {
    uploadType = 'chunked';
  } else if (uploadTypes.value.includes('folder') && Math.random() < 0.2) {
    uploadType = 'folder';
  }

  const baseSize =
    uploadType === 'chunked'
      ? 100 * 1024 * 1024 // 100MB for chunked
      : Math.random() * 50 * 1024 * 1024; // 0-50MB for regular

  // @ts-expect-error test
  const upload: AnyUploadProgressEntry = {
    id: `mock-upload-${Date.now()}-${index}`,
    name: uploadType === 'folder' ? `test-folder-${index}` : `test-file-${index}.${fileType}`,
    type: uploadType, // Use string directly
    status: UploadStatus.QUEUED,
    sizeBytes: Math.floor(baseSize),
    uploadedBytes: 0,
    uploadSpeed: 0,
    remainingTime: 0,
    message: null,
    parentId: 'test-parent',
    file: new File(['test content'], `test-file-${index}.${fileType}`),
    progress: 0,
  } as AnyUploadProgressEntry;

  // Add folder-specific properties
  if (uploadType === 'folder') {
    (upload as any).nodes = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
      localId: `node-${i}`,
      type: i % 3 === 0 ? 'folder' : 'file',
      name: `item-${i}`,
      remoteFolderId: null,
    }));
  }

  return upload;
}

// Simulation control
function startUploadSimulation() {
  allUploads.value.forEach((upload) => {
    if (upload.status === UploadStatus.QUEUED || upload.status === UploadStatus.UPLOADING) {
      startUploadProgress(upload);
    }
  });
}

function startUploadProgress(upload: AnyUploadProgressEntry) {
  if (activeSimulators.has(upload.id)) return;

  upload.status = UploadStatus.UPLOADING;
  upload.uploadedBytes = 0;
  upload.uploadSpeed = Math.random() * 5 * 1024 * 1024; // 0-5 MB/s

  const updateInterval = 200; // Update every 200ms
  const totalDuration = simulationDuration.value * 1000;
  const totalSteps = totalDuration / updateInterval;
  let currentStep = 0;

  const intervalId = setInterval(() => {
    currentStep++;

    // Update progress
    const baseProgress = currentStep / totalSteps;
    const variance = Math.random() * 0.05 - 0.025; // ±2.5% variance
    const progress = Math.min(1, Math.max(0, baseProgress + variance));

    upload.uploadedBytes = Math.floor(progress * upload.sizeBytes);

    // Simulate speed variations
    const speedVariation = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x speed
    upload.uploadSpeed = upload.uploadSpeed * speedVariation;

    // Handle completion or failure
    if (currentStep >= totalSteps) {
      // Determine outcome based on scenario
      const shouldFail = includeErrors.value && Math.random() < 0.15; // 15% failure rate

      if (shouldFail) {
        upload.status = UploadStatus.FAILED;
        upload.message = 'Simulated upload failure';
      } else {
        upload.status = UploadStatus.COMPLETED;
        upload.uploadedBytes = upload.sizeBytes;
      }

      clearInterval(intervalId);
      activeSimulators.delete(upload.id);
    }
  }, updateInterval);

  activeSimulators.set(upload.id, intervalId);
}

function pauseAllSimulations() {
  activeSimulators.forEach((intervalId, uploadId) => {
    clearInterval(intervalId);
    const upload = allUploads.value.find((u) => u.id === uploadId);
    if (upload && upload.status === UploadStatus.UPLOADING) {
      upload.status = UploadStatus.QUEUED;
    }
  });
  activeSimulators.clear();
}

async function resetAll() {
  pauseAllSimulations();
  await uploadStore.clearAllUploads();
  uploadStore.progressDialog = false;
}

// Individual upload controls
function toggleUploadStatus(upload: AnyUploadProgressEntry) {
  if (upload.status === UploadStatus.UPLOADING) {
    // Pause
    const intervalId = activeSimulators.get(upload.id);
    if (intervalId) {
      clearInterval(intervalId);
      activeSimulators.delete(upload.id);
    }
    upload.status = UploadStatus.QUEUED;
  } else if (upload.status === UploadStatus.QUEUED) {
    // Start
    startUploadProgress(upload);
  } else if (upload.status === UploadStatus.FAILED) {
    // Retry
    upload.status = UploadStatus.QUEUED;
    upload.message = '';
    upload.uploadedBytes = 0;
  }
}

function removeUpload(upload: AnyUploadProgressEntry) {
  const intervalId = activeSimulators.get(upload.id);
  if (intervalId) {
    clearInterval(intervalId);
    activeSimulators.delete(upload.id);
  }

  uploadStore.removeUploadById(upload.id);
}

// Helper functions
function getStatusColor(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.UPLOADING:
      return 'primary';
    case UploadStatus.COMPLETED:
      return 'positive';
    case UploadStatus.FAILED:
      return 'negative';
    case UploadStatus.QUEUED:
      return 'info';
    default:
      return 'grey';
  }
}

function getStatusIcon(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.UPLOADING:
      return 'cloud_upload';
    case UploadStatus.COMPLETED:
      return 'check_circle';
    case UploadStatus.FAILED:
      return 'error';
    case UploadStatus.QUEUED:
      return 'schedule';
    default:
      return 'help';
  }
}

function getToggleIcon(upload: AnyUploadProgressEntry): string {
  switch (upload.status) {
    case UploadStatus.UPLOADING:
      return 'pause';
    case UploadStatus.QUEUED:
      return 'play_arrow';
    case UploadStatus.FAILED:
      return 'refresh';
    default:
      return 'help';
  }
}

function getToggleColor(upload: AnyUploadProgressEntry): string {
  switch (upload.status) {
    case UploadStatus.UPLOADING:
      return 'warning';
    case UploadStatus.QUEUED:
      return 'positive';
    case UploadStatus.FAILED:
      return 'primary';
    default:
      return 'grey';
  }
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Cleanup
onUnmounted(() => {
  activeSimulators.forEach((intervalId) => clearInterval(intervalId));
  activeSimulators.clear();
});
</script>

<style scoped>
.upload-testbed {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
