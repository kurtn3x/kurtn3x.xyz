import { computed, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import axios from 'axios';
import { ChunkedUploadManager } from 'src/api/ChunkedUploadManager';
import { apiPost } from 'src/api/apiWrapper';
import { fileSizeDecimal } from 'src/components/lib/functions';
import { useFileOperationsStore } from './fileOperationsStore';
import type {
  UploadPreviewEntry,
  UploadProgressEntry,
  UploadTrackingInfo,
} from 'src/types/localTypes';
import { UploadStatus } from 'src/types/localTypes';

/**
 * Upload Store - Handles file uploads including chunked uploads for large files
 *
 * Features:
 * - Regular uploads for files < 50MB
 * - Chunked uploads for files >= 50MB with pause/resume
 * - Progress tracking and error handling
 * - Persistent upload state across browser sessions
 */
export const useUploadStore = defineStore('upload', () => {
  const q = useQuasar();
  const fileOps = useFileOperationsStore();

  // Constants
  const MAX_FILE_SIZE = 500 * 1024 * 1024 * 1024 * 1024; // 50GB
  const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB

  // ========================================
  // STATE
  // ========================================

  // Regular upload state
  const uploadPreviewList = ref<UploadPreviewEntry[]>([]);
  const uploadProgessList = ref<UploadProgressEntry[]>([]);
  const uploadInProgress = ref(false);
  const uploadDialogOpen = ref(false);

  // Chunked upload state
  const chunkedUploads = ref<UploadTrackingInfo[]>([]);
  const showChunkedProgress = ref(false);

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================

  const hasUploads = computed(() => uploadPreviewList.value.length > 0);

  const hasActiveRegularUploads = computed(() =>
    uploadProgessList.value.some((upload) => upload.status === 'loading'),
  );

  const hasActiveChunkedUploads = computed(() =>
    chunkedUploads.value.some(
      (upload) =>
        upload.status === UploadStatus.UPLOADING ||
        upload.status === UploadStatus.QUEUED ||
        upload.status === UploadStatus.PREPARING,
    ),
  );

  const hasAnyActiveUploads = computed(
    () => hasActiveRegularUploads.value || hasActiveChunkedUploads.value,
  );

  const completedChunkedUploads = computed(() =>
    chunkedUploads.value.filter((upload) => upload.status === UploadStatus.COMPLETED),
  );

  const failedChunkedUploads = computed(() =>
    chunkedUploads.value.filter((upload) => upload.status === UploadStatus.FAILED),
  );

  const totalUploadProgress = computed(() => {
    const regularProgress = uploadProgessList.value.reduce(
      (sum, upload) => sum + upload.transferredPercent,
      0,
    );
    const chunkedProgress = chunkedUploads.value.reduce(
      (sum, upload) => sum + upload.uploadedBytes / upload.size,
      0,
    );

    const totalItems = uploadProgessList.value.length + chunkedUploads.value.length;
    return totalItems > 0 ? (regularProgress + chunkedProgress) / totalItems : 0;
  });

  // ========================================
  // REGULAR UPLOAD METHODS
  // ========================================

  /**
   * Add files to the upload queue
   */
  // function addToUploadList(files: UploadPreviewEntry[]) {
  //   uploadPreviewList.value.push(...files);

  //   // Automatically show chunked progress if any large files
  //   const hasLargeFiles = files.some((file) => {
  //     if (file.type === 'file' && file.content instanceof File) {
  //       return file.content.size >= CHUNKED_UPLOAD_THRESHOLD;
  //     }
  //     return false;
  //   });

  //   if (hasLargeFiles) {
  //     showChunkedProgress.value = true;
  //   }
  // }

  function validName(name: string) {
    if (name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Name must be at least 1 character long.',
      });
      return false;
    }

    // FIXME:
    if (name.includes('/') || name.includes('\x00')) {
      q.notify({
        type: 'negative',
        message: 'Name contains invalid characters.',
      });
      return false;
    }

    if (nameAvailable(name) === false) {
      q.notify({
        type: 'negative',
        message: 'Item with same name already exists in upload list',
      });
      return false;
    }

    return true;
  }

  function nameAvailable(name: string) {
    if (uploadPreviewList.value.some((el: UploadPreviewEntry) => el.name === name)) {
      return false;
    }

    if (fileOps.rawFolderContent.children.some((el) => el.name === name)) {
      return false;
    }
    return true;
  }

  /**
   * Find a valid name for a file or folder
   * If the name already exists, add (1), (2), etc. until a unique name is found
   *
   * @param name The original name to check and potentially modify
   * @param type 'file' or 'folder' - affects how extensions are handled
   * @returns A valid, unique name
   */
  function findAvailableName(originalName: string, type: 'file' | 'folder'): string {
    // Check if the original name is valid as-is
    if (nameAvailable(originalName)) {
      return originalName;
    }

    // For files, we need to handle extensions properly
    if (type === 'file') {
      // Get the file name without the extension
      let nameWithoutExtension = originalName;
      let extension = '';

      // Check if this file has an extension (it has a dot that isn't the first character)
      if (originalName.indexOf('.') > 0) {
        extension = originalName.substring(originalName.lastIndexOf('.'));
        nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
      }

      // Check if the name already has a number in parentheses
      const parenthesisRegex = /\((\d+)\)$/;
      const match = nameWithoutExtension.match(parenthesisRegex);

      let counter = 1;
      let newName = '';

      if (match) {
        // If it already has a number, start counting from that number + 1
        counter = parseInt(match[1]!, 10) + 1;
        nameWithoutExtension = nameWithoutExtension.replace(parenthesisRegex, '');
      }

      // Keep incrementing the counter until we find a unique name
      do {
        newName = `${nameWithoutExtension}(${counter})${extension}`;
        counter++;
      } while (!nameAvailable(newName));

      return newName;
    }
    // For folders (simpler, no extension handling)
    else {
      const parenthesisRegex = /\((\d+)\)$/;
      const match = originalName.match(parenthesisRegex);

      let counter = 1;
      let nameBase = originalName;
      let newName = '';

      if (match) {
        // If it already has a number, start counting from that number + 1
        counter = parseInt(match[1]!, 10) + 1;
        nameBase = originalName.replace(parenthesisRegex, '');
      }

      // Keep incrementing the counter until we find a unique name
      do {
        newName = `${nameBase}(${counter})`;
        counter++;
      } while (!nameAvailable(newName));

      return newName;
    }
  }

  // ///////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Add a file or folder to the upload list as a previewable entry
   *
   * -> entry should be FileSystemEntry if type is 'folder'
   *
   * -> entry should be File if type is 'file'
   */
  function addUploadEntry(entry: File | FileSystemEntry, type: 'file' | 'folder') {
    const name = entry.name;

    // dont bother finding names for files/folders with invalid names
    if (name.includes('/') || name.includes('\x00') || name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Item has an invalid name',
      });
      return;
    }

    if (type === 'file' && entry instanceof File) {
      const validName = findAvailableName(name, type);
      if (validName) {
        uploadPreviewList.value.push({
          name: validName,
          type: 'file',
          content: entry,
          edit: false,
          edit_name: '',
        });
      }
    } else if (type === 'folder' && entry instanceof FileSystemDirectoryEntry) {
      const validName = findAvailableName(name, type);
      if (validName) {
        uploadPreviewList.value.push({
          name: validName,
          type: 'folder',
          content: entry,
          edit: false,
          edit_name: '',
        });
      }
    }
  }

  /**
   * Remove a file from the upload preview list by name
   */
  function removeUploadEntry(name: string) {
    uploadPreviewList.value = uploadPreviewList.value.filter((item) => item.name !== name);
  }

  /**
   * Clear the upload preview list
   */
  function clearUploadList() {
    uploadPreviewList.value = [];
  }

  /**
   * Handle file name changes inside the upload preview list
   */
  function changeFileName(file: UploadPreviewEntry) {
    if (!file.edit_name || file.edit_name === file.name) {
      file.edit = false;
      return true;
    }

    if (validName(file.edit_name)) {
      file.name = file.edit_name;
      file.edit = false;
      return true;
    }

    return false;
  }

  /**
   * Start uploading from dialog
   */
  async function startUploadFromDialog() {
    if (uploadPreviewList.value.length === 0) return;

    uploadDialogOpen.value = false;
    uploadInProgress.value = true;

    try {
      const parentId = fileOps.rawFolderContent.id;

      for (const item of uploadPreviewList.value) {
        if (item.type === 'file') {
          await uploadFile(item, parentId);
        } else if (item.type === 'folder') {
          await uploadFolder(item, parentId);
        }
      }

      // Clean up completed uploads
      clearUploadList();

      if (!hasActiveChunkedUploads.value) {
        uploadInProgress.value = false;
      }
    } catch (error: any) {
      q.notify({
        type: 'negative',
        message: error.message || 'Upload failed',
      });
      uploadInProgress.value = false;
    }
  }

  /**
   * Upload a single file
   *
   * Handles both regular and chunked uploads based on file size
   */
  async function uploadFile(fileItem: UploadPreviewEntry, parentId: string): Promise<boolean> {
    if (fileItem.content instanceof FileSystemEntry) return false;

    const file = fileItem.content;
    const itemSize = file.size;

    // Check file size limits
    if (itemSize > MAX_FILE_SIZE) {
      q.notify({
        type: 'negative',
        message: `File "${fileItem.name}" exceeds the maximum upload limit of ${fileSizeDecimal(
          MAX_FILE_SIZE,
        )}.`,
      });
      return false;
    }

    // Use chunked upload for large files
    if (itemSize >= CHUNKED_UPLOAD_THRESHOLD) {
      try {
        await startChunkedUpload(file, parentId);
        return true;
      } catch (error: any) {
        q.notify({
          type: 'negative',
          message: `Chunked upload failed for "${fileItem.name}": ${error.message}`,
        });
        return false;
      }
    }

    // Use regular upload for smaller files
    return await regularUpload(fileItem, parentId);
  }

  /**
   * Regular upload for smaller files
   */
  async function regularUpload(fileItem: UploadPreviewEntry, parentId: string): Promise<boolean> {
    const file = fileItem.content as File;

    const formData = new FormData();
    // use snake case in form data because camelcase serializer doesn't work for somer reason
    formData.append('name', fileItem.name);
    formData.append('parent_id', parentId);
    formData.append('node_type', 'file');
    formData.append('file_content', file);

    const source = axios.CancelToken.source();

    const fileProgress: UploadProgressEntry = reactive({
      name: fileItem.name,
      status: 'loading',
      message: '',
      abort: source,
      size: fileSizeDecimal(file.size),
      transferred: '0B',
      transferredPercent: 0,
    });

    uploadProgessList.value.push(fileProgress);

    const config = {
      withCredentials: true,
      onUploadProgress: (progressEvent: ProgressEvent) => {
        fileProgress.transferred = fileSizeDecimal(progressEvent.loaded);
        fileProgress.transferredPercent = progressEvent.loaded / file.size;
      },
      cancelToken: source.token,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
        // 'Content-Type': 'multipart/form-data',
      },
    };

    try {
      const apiData = await apiPost('files/nodes/', formData, config);

      if (apiData.error === false) {
        fileProgress.status = 'ok';
        fileProgress.transferredPercent = 1;
        fileProgress.message = 'Upload completed';

        // Refresh folder after successful upload
        await fileOps.refreshFolder();

        return true;
      } else {
        fileProgress.status = 'error';
        fileProgress.transferredPercent = 0;
        fileProgress.message = apiData.errorMessage;
        return false;
      }
    } catch (error: any) {
      if (!axios.isCancel(error)) {
        fileProgress.status = 'error';
        fileProgress.transferredPercent = 0;
        fileProgress.message = error.message || 'Upload failed';
      }
      return false;
    }
  }

  function cancelRegularUpload(index: number) {
    const upload = uploadProgessList.value[index];
    if (upload && upload.abort) {
      upload.abort.cancel('Upload cancelled by user');
      upload.status = 'error';
      upload.message = 'Cancelled';
    }
  }

  function cancelRegularUploadByName(name: string) {
    const index = uploadProgessList.value.findIndex((upload) => upload.name === name);
    if (index !== -1) {
      cancelRegularUpload(index);
    }
  }

  function cancelAllRegularUploads() {
    uploadProgessList.value.forEach((upload, index) => {
      if (upload.status === 'loading') {
        cancelRegularUpload(index);
      }
    });
  }

  function clearCompletedRegularUploads() {
    uploadProgessList.value = uploadProgessList.value.filter(
      (upload) => upload.status === 'loading',
    );
  }

  /**
   * Upload a folder (recursive)
   */
  /* eslint-disable */

  async function uploadFolder(folderItem: UploadPreviewEntry, parentId: string): Promise<boolean> {
    // Implementation for folder upload
    // This would require recursive handling of folder contents
    q.notify({
      type: 'info',
      message: 'Folder upload not yet implemented',
    });
    return false;
  }
  /* eslint-enable */

  /**
   * Cancel a regular upload
   */
  function cancelUpload(index: number) {
    const upload = uploadProgessList.value[index];
    if (upload && upload.abort) {
      upload.abort.cancel('Upload cancelled by user');
      upload.status = 'error';
      upload.message = 'Cancelled';
    }
  }

  /**
   * Clear completed regular uploads
   */
  function clearCompletedUploads() {
    uploadProgessList.value = uploadProgessList.value.filter(
      (upload) => upload.status === 'loading',
    );
  }

  /**
   * Clear all regular uploads
   */
  function clearAllUploads() {
    // Cancel any active uploads
    uploadProgessList.value.forEach((upload, index) => {
      if (upload.status === 'loading') {
        cancelUpload(index);
      }
    });

    uploadProgessList.value = [];
    uploadInProgress.value = false;
  }

  // ========================================
  // CHUNKED UPLOAD METHODS
  // ========================================

  /**
   * Initialize chunked uploads from storage
   */
  function initializeChunkedUploads() {
    try {
      refreshChunkedUploadsList();
    } catch (error: any) {
      console.warn('Failed to restore chunked upload state:', error);
    }
  }

  /**
   * Refresh chunked uploads list from manager
   */
  function refreshChunkedUploadsList() {
    chunkedUploads.value = ChunkedUploadManager.getAllUploads();
  }

  /**
   * Start a chunked upload
   */
  async function startChunkedUpload(file: File, parentId: string): Promise<UploadTrackingInfo> {
    try {
      showChunkedProgress.value = true;

      // Initialize the upload
      const uploadInfo = await ChunkedUploadManager.initUpload(file, parentId);
      refreshChunkedUploadsList();

      // Start the upload
      await ChunkedUploadManager.startUpload(uploadInfo.id);
      refreshChunkedUploadsList();

      // Monitor progress
      monitorChunkedUpload(uploadInfo.id);

      return uploadInfo;
    } catch (error: any) {
      throw new Error(`Failed to start chunked upload: ${error.message}`);
    }
  }

  /**
   * Monitor chunked upload progress
   */
  function monitorChunkedUpload(uploadId: string) {
    const interval = setInterval(() => {
      refreshChunkedUploadsList();
      const upload = ChunkedUploadManager.getUpload(uploadId);

      if (!upload) {
        clearInterval(interval);
        return;
      }

      // Check if upload is finished
      if (upload.status === UploadStatus.COMPLETED) {
        clearInterval(interval);
        q.notify({
          type: 'positive',
          message: `Upload completed: ${upload.name}`,
          timeout: 3000,
        });

        // Refresh the file list
        fileOps.refreshFolder().catch(console.error);

        // Save state and clean up after delay
        setTimeout(() => {
          autoCleanupCompleted();
        }, 5000);
      } else if (upload.status === UploadStatus.FAILED) {
        clearInterval(interval);
        q.notify({
          type: 'negative',
          message: `Upload failed: ${upload.name} - ${upload.message}`,
          timeout: 5000,
        });
      } else if (upload.status === UploadStatus.CANCELED) {
        clearInterval(interval);
        q.notify({
          type: 'info',
          message: `Upload canceled: ${upload.name}`,
          timeout: 3000,
        });
      }

      // Update overall upload progress state
      if (!hasActiveChunkedUploads.value && !hasActiveRegularUploads.value) {
        uploadInProgress.value = false;
      }
    }, 1000); // Update every second
  }

  /**
   * Cancel a chunked upload
   */
  async function cancelChunkedUpload(uploadId: string): Promise<void> {
    try {
      await ChunkedUploadManager.cancelUpload(uploadId);
      refreshChunkedUploadsList();
    } catch (error: any) {
      q.notify({
        type: 'negative',
        message: `Failed to cancel upload: ${error.message}`,
        timeout: 5000,
      });
    }
  }

  /**
   * Retry a failed chunked upload
   */
  async function retryChunkedUpload(uploadId: string): Promise<void> {
    try {
      // Reset the upload status and try again
      const upload = ChunkedUploadManager.getUpload(uploadId);
      if (upload) {
        upload.status = UploadStatus.QUEUED;
        upload.message = '';
        await ChunkedUploadManager.startUpload(uploadId);
        monitorChunkedUpload(uploadId);
        refreshChunkedUploadsList();
      }
    } catch (error: any) {
      q.notify({
        type: 'negative',
        message: `Failed to retry upload: ${error.message}`,
        timeout: 5000,
      });
    }
  }

  /**
   * Remove completed chunked uploads
   */
  function removeCompletedChunkedUploads() {
    const completedIds = chunkedUploads.value
      .filter((upload) => upload.status === UploadStatus.COMPLETED)
      .map((upload) => upload.id);

    completedIds.forEach((id) => {
      ChunkedUploadManager.removeUpload(id);
    });

    refreshChunkedUploadsList();

    if (chunkedUploads.value.length === 0) {
      showChunkedProgress.value = false;
    }
  }

  /**
   * Clear all chunked uploads
   */
  function clearAllChunkedUploads() {
    // Cancel active uploads first
    const activeUploads = chunkedUploads.value.filter((upload) =>
      [UploadStatus.UPLOADING, UploadStatus.QUEUED].includes(upload.status),
    );

    activeUploads.forEach((upload) => {
      ChunkedUploadManager.cancelUpload(upload.id).catch(console.error);
    });

    // Clear all uploads
    ChunkedUploadManager.clearAllUploads();
    chunkedUploads.value = [];
    showChunkedProgress.value = false;
  }

  /**
   * Auto cleanup completed uploads after some time
   */
  function autoCleanupCompleted() {
    if (completedChunkedUploads.value.length > 5) {
      // Keep only the 3 most recent completed uploads
      const sortedCompleted = completedChunkedUploads.value.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      const toRemove = sortedCompleted.slice(3);
      toRemove.forEach((upload) => {
        ChunkedUploadManager.removeUpload(upload.id);
      });

      refreshChunkedUploadsList();
    }
  }

  /**
   * Toggle chunked progress visibility
   */
  function toggleChunkedProgress() {
    showChunkedProgress.value = !showChunkedProgress.value;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get upload statistics
   */
  function getUploadStats() {
    const regular = {
      total: uploadProgessList.value.length,
      active: uploadProgessList.value.filter((u) => u.status === 'loading').length,
      completed: uploadProgessList.value.filter((u) => u.status === 'ok').length,
      failed: uploadProgessList.value.filter((u) => u.status === 'error').length,
    };

    const chunked = {
      total: chunkedUploads.value.length,
      active: chunkedUploads.value.filter((u) =>
        [UploadStatus.UPLOADING, UploadStatus.QUEUED, UploadStatus.PREPARING].includes(u.status),
      ).length,
      completed: completedChunkedUploads.value.length,
      failed: failedChunkedUploads.value.length,
    };

    return { regular, chunked };
  }

  /**
   * Reset all upload state
   */
  function resetUploadState() {
    clearAllUploads();
    clearAllChunkedUploads();
    uploadDialogOpen.value = false;
    uploadInProgress.value = false;
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  // Initialize chunked uploads on store creation
  initializeChunkedUploads();

  // ========================================
  // RETURN STORE INTERFACE
  // ========================================

  return {
    // State
    uploadPreviewList,
    uploadProgessList,
    uploadInProgress,
    uploadDialogOpen,
    chunkedUploads,
    showChunkedProgress,

    // Computed
    hasUploads,
    hasActiveRegularUploads,
    hasActiveChunkedUploads,
    hasAnyActiveUploads,
    completedChunkedUploads,
    failedChunkedUploads,
    totalUploadProgress,

    // Regular upload methods
    addUploadEntry,
    removeUploadEntry,
    changeFileName,
    clearUploadList,
    startUploadFromDialog,
    uploadFile,
    cancelUpload,
    clearCompletedUploads,
    clearAllUploads,

    // Chunked upload methods
    startChunkedUpload,
    cancelChunkedUpload,
    retryChunkedUpload,
    removeCompletedChunkedUploads,
    clearAllChunkedUploads,
    refreshChunkedUploadsList,
    toggleChunkedProgress,

    // Utility methods
    getUploadStats,
    resetUploadState,

    // Constants (for external access)
    MAX_FILE_SIZE,
    CHUNKED_UPLOAD_THRESHOLD,
  };
});
