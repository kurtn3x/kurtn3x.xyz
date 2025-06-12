import { computed, type Ref } from 'vue';
import { uploadTypeUtils } from './helpers/uploadStatus';
import type { AnyUploadProgressEntry, UploadStatus } from 'src/types/localTypes';

export function useUploadQueue(
  uploadQueue: Ref<AnyUploadProgressEntry[]>,
  uploadProgressList: Ref<AnyUploadProgressEntry[]>,
) {
  /**
   * Move upload from queue to progress list
   */
  const moveToProgress = (uploadId: string): AnyUploadProgressEntry | null => {
    const queueIndex = uploadQueue.value.findIndex((u) => u.id === uploadId);
    if (queueIndex === -1) return null;

    const upload = uploadQueue.value[queueIndex]!;
    uploadQueue.value.splice(queueIndex, 1);
    uploadProgressList.value.push(upload);
    return upload;
  };

  /**
   * Move upload from progress list back to queue
   */
  const moveToQueue = (uploadId: string): AnyUploadProgressEntry | null => {
    const progressIndex = uploadProgressList.value.findIndex((u) => u.id === uploadId);
    if (progressIndex === -1) return null;

    const upload = uploadProgressList.value[progressIndex]!;
    uploadProgressList.value.splice(progressIndex, 1);
    uploadQueue.value.unshift(upload);
    return upload;
  };

  /**
   * Remove upload from all lists
   */
  const removeById = (uploadId: string): boolean => {
    const queueIndex = uploadQueue.value.findIndex((u) => u.id === uploadId);
    if (queueIndex !== -1) {
      uploadQueue.value.splice(queueIndex, 1);
      return true;
    }

    const progressIndex = uploadProgressList.value.findIndex((u) => u.id === uploadId);
    if (progressIndex !== -1) {
      uploadProgressList.value.splice(progressIndex, 1);
      return true;
    }

    return false;
  };

  /**
   * Find upload in any list
   */
  const findUpload = (uploadId: string): AnyUploadProgressEntry | null => {
    return (
      uploadQueue.value.find((u) => u.id === uploadId) ||
      uploadProgressList.value.find((u) => u.id === uploadId) ||
      null
    );
  };

  /**
   * Get uploads by status from all lists
   */
  const getUploadsByStatus = (status: UploadStatus): AnyUploadProgressEntry[] => {
    const allUploads = [...uploadQueue.value, ...uploadProgressList.value];
    return allUploads.filter((upload) => upload.status === status);
  };

  /**
   * Clear all uploads from both lists
   */
  const clearAll = (): void => {
    uploadQueue.value = [];
    uploadProgressList.value = [];
  };

  /**
   * Get upload by ID from any list
   */
  const getUploadById = (
    uploadId: string,
  ): { upload: AnyUploadProgressEntry; location: 'queue' | 'progress' } | null => {
    const queueUpload = uploadQueue.value.find((u) => u.id === uploadId);
    if (queueUpload) {
      return { upload: queueUpload, location: 'queue' };
    }

    const progressUpload = uploadProgressList.value.find((u) => u.id === uploadId);
    if (progressUpload) {
      return { upload: progressUpload, location: 'progress' };
    }

    return null;
  };

  /**
   * Move multiple uploads to progress
   */
  const moveMultipleToProgress = (uploadIds: string[]): AnyUploadProgressEntry[] => {
    const movedUploads: AnyUploadProgressEntry[] = [];

    uploadIds.forEach((uploadId) => {
      const upload = moveToProgress(uploadId);
      if (upload) {
        movedUploads.push(upload);
      }
    });

    return movedUploads;
  };

  /**
   * Remove multiple uploads by IDs
   */
  const removeMultipleById = (uploadIds: string[]): number => {
    let removedCount = 0;

    uploadIds.forEach((uploadId) => {
      if (removeById(uploadId)) {
        removedCount++;
      }
    });

    return removedCount;
  };

  /**
   * Get queue position of an upload
   */
  const getQueuePosition = (uploadId: string): number => {
    return uploadQueue.value.findIndex((u) => u.id === uploadId);
  };

  /**
   * Reorder upload in queue
   */
  const reorderInQueue = (uploadId: string, newPosition: number): boolean => {
    const currentIndex = uploadQueue.value.findIndex((u) => u.id === uploadId);
    if (currentIndex === -1 || newPosition < 0 || newPosition >= uploadQueue.value.length) {
      return false;
    }

    const upload = uploadQueue.value.splice(currentIndex, 1)[0]!;
    uploadQueue.value.splice(newPosition, 0, upload);
    return true;
  };

  // ========================================
  // COMPUTED PROPERTIES (Reactive!)
  // ========================================

  /**
   * Get queued uploads ready for processing (reactive)
   */
  const queuedUploads = computed(() => uploadQueue.value.filter(uploadTypeUtils.isQueued));

  /**
   * Get active uploads (reactive)
   */
  const activeUploads = computed(() => uploadProgressList.value.filter(uploadTypeUtils.isActive));

  /**
   * Get all uploads from both lists (reactive)
   */
  const allUploads = computed(() => [...uploadQueue.value, ...uploadProgressList.value]);

  /**
   * Get queue statistics (reactive)
   */
  const queueStats = computed(() => ({
    queueLength: uploadQueue.value.length,
    progressLength: uploadProgressList.value.length,
    totalUploads: uploadQueue.value.length + uploadProgressList.value.length,
    queuedCount: queuedUploads.value.length,
    activeCount: activeUploads.value.length,
  }));

  /**
   * Check if queue is empty (reactive)
   */
  const isQueueEmpty = computed(() => uploadQueue.value.length === 0);

  /**
   * Check if progress list is empty (reactive)
   */
  const isProgressEmpty = computed(() => uploadProgressList.value.length === 0);

  /**
   * Check if any uploads are active (reactive)
   */
  const hasActiveUploads = computed(() => activeUploads.value.length > 0);

  /**
   * Get total bytes for all uploads (reactive)
   */
  const totalBytes = computed(() =>
    allUploads.value.reduce((sum, upload) => sum + upload.sizeBytes, 0),
  );

  /**
   * Get uploaded bytes for all uploads (reactive)
   */
  const uploadedBytes = computed(() =>
    allUploads.value.reduce((sum, upload) => sum + upload.uploadedBytes, 0),
  );

  /**
   * Get overall progress percentage (reactive)
   */
  const overallProgress = computed(() => {
    const total = totalBytes.value;
    const uploaded = uploadedBytes.value;
    return total > 0 ? (uploaded / total) * 100 : 0;
  });

  return {
    // Core queue management functions
    moveToProgress,
    moveToQueue,
    removeById,
    findUpload,
    getUploadsByStatus,
    clearAll,

    // Enhanced functions
    getUploadById,
    moveMultipleToProgress,
    removeMultipleById,
    getQueuePosition,
    reorderInQueue,

    // Reactive computed properties
    queuedUploads,
    activeUploads,
    allUploads,
    queueStats,
    isQueueEmpty,
    isProgressEmpty,
    hasActiveUploads,
    totalBytes,
    uploadedBytes,
    overallProgress,
  };
}
