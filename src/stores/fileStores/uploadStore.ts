import { computed, nextTick, ref } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import { useFolderUpload } from 'src/components/files/upload/folderUpload';
import {
  uploadStatusUtils,
  uploadTypeUtils,
} from 'src/components/files/upload/helpers/uploadStatus';
import {
  ChunkedUploadHandler,
  FolderUploadHandler,
  RegularUploadHandler,
} from 'src/components/files/upload/uploadHandler';
import { useUploadOrchestrator } from 'src/components/files/upload/uploadOrchestrator';
import { useUploadQueue } from 'src/components/files/upload/uploadQueue';
import { useFileOperationsStore } from './fileOperationsStore';
import type { AnyUploadProgressEntry, UploadPreviewEntry } from 'src/types/localTypes';
import {
  isChunkedUpload,
  isFolderUpload,
  isRegularUpload,
  UploadStatus,
} from 'src/types/localTypes';

export const useUploadStore = defineStore('upload', () => {
  const q = useQuasar();
  const fileOps = useFileOperationsStore();
  const folderUpload = useFolderUpload();

  // Constants
  const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB

  // ========================================
  // STATE
  // ========================================

  const uploadPreviewList = ref<UploadPreviewEntry[]>([]);
  const uploadProgressList = ref<AnyUploadProgressEntry[]>([]);
  const uploadQueue = ref<AnyUploadProgressEntry[]>([]);
  const isProcessorActive = ref(false);
  const maxConcurrentUploads = ref(3);
  const processingScheduled = ref(false);

  // track the dialog in store for automatic opening
  const progressDialog = ref(false);

  // ========================================
  // COMPOSABLES & HANDLERS
  // ========================================

  // Use the queue composable instead of class
  const queueManager = useUploadQueue(uploadQueue, uploadProgressList);

  const uploadOrchestrator = useUploadOrchestrator(fileOps, {
    preview: uploadPreviewList,
    progress: uploadProgressList,
    queue: uploadQueue,
  });

  const processor = uploadOrchestrator.getProcessor();

  // Initialize upload handlers with orchestrator methods
  const uploadHandlers = {
    regular: new RegularUploadHandler(processor.executeRegularUpload),
    chunked: new ChunkedUploadHandler(processor.executeChunkedUpload),
    folder: new FolderUploadHandler(
      (upload) =>
        processor.executeFolderUpload(upload, (entries) => uploadQueue.value.push(...entries)),
      (entries) => uploadQueue.value.push(...entries),
    ),
  };

  // ========================================
  // COMPUTED PROPERTIES (Using Queue Manager)
  // ========================================

  const showProgressDialog = computed(() => progressDialog.value);
  const hasUploads = computed(() => uploadPreviewList.value.length > 0);
  const uploadInProgress = computed(() => queueManager.hasActiveUploads.value);

  // Use queue manager's reactive computed properties
  const hasActiveUploads = queueManager.hasActiveUploads;
  const queuedUploads = queueManager.queuedUploads;
  const activeUploads = queueManager.activeUploads;
  const totalUploadProgress = computed(() => queueManager.overallProgress.value);

  const hasActiveRegularUploads = computed(() =>
    uploadProgressList.value.some(
      (upload) => isRegularUpload(upload) && uploadTypeUtils.isActive(upload),
    ),
  );

  const hasActiveChunkedUploads = computed(() =>
    uploadProgressList.value.some(
      (upload) => isChunkedUpload(upload) && uploadTypeUtils.isActive(upload),
    ),
  );

  const completedUploads = computed(() => queueManager.getUploadsByStatus(UploadStatus.COMPLETED));
  const failedUploads = computed(() => queueManager.getUploadsByStatus(UploadStatus.FAILED));

  // ========================================
  // SIMPLIFIED UPLOAD METHODS
  // ========================================

  function getUploadHandler(upload: AnyUploadProgressEntry) {
    if (isRegularUpload(upload)) {
      return uploadHandlers.regular;
    } else if (isChunkedUpload(upload)) {
      return uploadHandlers.chunked;
    } else if (isFolderUpload(upload)) {
      return uploadHandlers.folder;
    } else {
      throw new Error('Unknown upload type');
    }
  }

  async function executeUpload(upload: AnyUploadProgressEntry): Promise<void> {
    try {
      const handler = getUploadHandler(upload);
      const success = await handler.execute(upload);

      if (success) {
        q.notify({ type: 'positive', message: `Upload completed: ${upload.name}` });
      }
    } catch (error: any) {
      console.error(`Upload execution failed for ${upload.name}:`, error);
      uploadStatusUtils.markAsFailed(upload, error.message || 'Upload failed');
    } finally {
      setTimeout(() => {
        triggerUploadProcessing();
      }, 250);
    }
  }

  // ========================================
  // SIMPLIFIED CONTROL METHODS
  // ========================================

  async function cancelUpload(uploadId: string): Promise<void> {
    const queuedUpload = uploadQueue.value.find((u) => u.id === uploadId);
    if (queuedUpload) {
      uploadStatusUtils.markAsCanceled(queuedUpload);
      queueManager.moveToProgress(uploadId);
      triggerUploadProcessing();
      return;
    }

    const upload = queueManager.findUpload(uploadId);
    if (!upload || !uploadTypeUtils.isCancelable(upload)) return;

    try {
      const handler = getUploadHandler(upload);
      await handler.cancel(upload);
    } catch (error) {
      console.error(`Error canceling upload ${uploadId}:`, error);
    }

    triggerUploadProcessing();
  }

  async function retryUpload(uploadId: string): Promise<void> {
    try {
      const upload = queueManager.findUpload(uploadId);
      if (!upload || !uploadTypeUtils.isRetryable(upload)) {
        throw new Error('Upload not found or not retryable');
      }

      const handler = getUploadHandler(upload);
      await handler.retry(upload);

      if (isFolderUpload(upload) && upload.status !== UploadStatus.FAILED) {
        const fileUploadEntries = folderUpload.createFileUploadEntries(upload);
        uploadQueue.value.push(...fileUploadEntries);
      } else if (!isFolderUpload(upload)) {
        queueManager.moveToQueue(uploadId);
      }

      triggerUploadProcessing();

      q.notify({
        type: 'positive',
        message: `Retrying upload: ${upload.name}`,
        timeout: 3000,
      });
    } catch (error: any) {
      q.notify({
        type: 'negative',
        message: `Failed to retry upload: ${error.message}`,
        timeout: 5000,
      });
    }
  }

  // ========================================
  // DELEGATED METHODS (Using UploadOrchestrator)
  // ========================================

  function uploadFromPreviewList(): void {
    if (uploadPreviewList.value.length === 0) return;

    const stats = uploadOrchestrator.getPreviewStats();
    console.log(`Starting upload of ${stats.totalFiles} files, ${stats.totalFolders} folders`);

    progressDialog.value = true;

    try {
      const progressEntries = uploadOrchestrator.createUploadProgressEntries();

      if (progressEntries.length === 0) {
        q.notify({
          type: 'negative',
          message: 'No valid uploads to process',
        });
        return;
      }

      uploadQueue.value.push(...progressEntries);
      uploadOrchestrator.clearPreview();

      q.notify({
        type: 'positive',
        message: `Started uploading ${progressEntries.length} items`,
        timeout: 3000,
      });

      triggerUploadProcessing();
    } catch (error: any) {
      q.notify({
        type: 'negative',
        message: error.message || 'Upload preparation failed',
      });
    }
  }

  // Delegate to upload orchestrator
  const addUploadEntry = uploadOrchestrator.addUploadEntry;
  const changeFileName = uploadOrchestrator.changeFileName;

  // ========================================
  // REMAINING CORE STORE METHODS
  // ========================================

  function removeUploadEntry(name: string): void {
    uploadOrchestrator.removePreviewItem(name);
    uploadQueue.value = uploadQueue.value.filter((item) => item.name !== name);
  }

  function removeUploadById(id: string): void {
    queueManager.removeById(id);
  }

  function clearUploadList(): void {
    uploadOrchestrator.clearPreview();
  }

  function clearCompletedUploads(): void {
    const completedIds = completedUploads.value.map((upload) => upload.id);
    queueManager.removeMultipleById(completedIds);
  }

  async function clearAllUploads(): Promise<void> {
    console.log('Clearing all uploads...');

    processingScheduled.value = false;
    isProcessorActive.value = false;

    const cancelPromises = activeUploads.value.map(async (upload) => {
      try {
        await cancelUpload(upload.id);
      } catch (error) {
        console.error(`Error canceling upload ${upload.id}:`, error);
      }
    });

    queuedUploads.value.forEach((upload) => {
      uploadStatusUtils.markAsCanceled(upload);
    });

    if (cancelPromises.length > 0) {
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 5000);
      });
      await Promise.race([Promise.allSettled(cancelPromises), timeoutPromise]);
    }

    queueManager.clearAll();
    progressDialog.value = false;

    q.notify({
      type: 'info',
      message: 'All uploads have been canceled',
    });
  }

  // ========================================
  // QUEUE PROCESSING (Using Queue Manager)
  // ========================================

  function processUploads(): void {
    if (isProcessorActive.value) return;

    isProcessorActive.value = true;
    processingScheduled.value = false;

    try {
      const activeCount = activeUploads.value.length;
      const availableSlots = maxConcurrentUploads.value - activeCount;

      if (availableSlots > 0 && queuedUploads.value.length > 0) {
        const uploadsToStart = queuedUploads.value.slice(0, availableSlots);

        for (const upload of uploadsToStart) {
          if (uploadTypeUtils.isQueued(upload)) {
            queueManager.moveToProgress(upload.id);
            executeUpload(upload).catch((error) => {
              console.error(`Upload failed for ${upload.name}:`, error);
            });
          }
        }
      }
    } finally {
      isProcessorActive.value = false;
    }
  }

  function triggerUploadProcessing(): void {
    if (processingScheduled.value) return;

    processingScheduled.value = true;
    nextTick(() => {
      try {
        processUploads();

        const shouldContinue =
          queuedUploads.value.length > 0 &&
          activeUploads.value.length < maxConcurrentUploads.value &&
          !isProcessorActive.value;

        if (shouldContinue) {
          setTimeout(() => {
            if (queuedUploads.value.length > 0) {
              triggerUploadProcessing();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error in triggerUploadProcessing:', error);
        processingScheduled.value = false;
      }
    }).catch((error) => {
      console.error('Error in nextTick:', error);
      processingScheduled.value = false;
    });
  }

  function getUploadStats() {
    return queueManager.queueStats.value;
  }

  function toogleProgressDialog(): void {
    progressDialog.value = !progressDialog.value;
  }

  return {
    // State
    uploadPreviewList,
    uploadProgressList,
    uploadQueue,
    uploadInProgress,
    progressDialog,
    maxConcurrentUploads,
    showProgressDialog,

    // Computed (using queue manager)
    hasUploads,
    hasActiveUploads,
    hasActiveRegularUploads,
    hasActiveChunkedUploads,
    completedUploads,
    failedUploads,
    totalUploadProgress,
    queuedUploads,
    activeUploads,

    // Queue management methods
    moveUploadToProgress: queueManager.moveToProgress,
    moveUploadToQueue: queueManager.moveToQueue,
    reorderInQueue: queueManager.reorderInQueue,

    // Upload preview methods
    addUploadEntry,
    removeUploadEntry,
    changeFileName,
    clearUploadList,

    // Upload execution methods
    uploadFromPreviewList,

    // Upload control methods
    cancelUpload,
    retryUpload,
    removeUploadById,

    // Cleanup methods
    clearCompletedUploads,
    clearAllUploads,

    // Utility methods
    getUploadStats,
    toogleProgressDialog,

    // Constants
    CHUNKED_UPLOAD_THRESHOLD,
  };
});
