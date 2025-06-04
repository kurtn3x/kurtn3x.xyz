import { computed, nextTick, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import axios from 'axios';
import { apiPost } from 'src/api/apiWrapper';
import { useChunkedUpload } from 'src/api/chunkedUpload';
import { useFolderUpload } from 'src/api/folderUpload';
import { fileSizeDecimal, generateUniqueUploadId } from 'src/components/lib/functions';
import { useFileOperationsStore } from './fileOperationsStore';
import type {
  AnyTrackerNode,
  AnyUploadProgressEntry,
  ChunkedUploadProgressEntry,
  FolderUploadProgressEntry,
  RegularUploadProgressEntry,
  UploadPreviewEntry,
} from 'src/types/localTypes';
import {
  isChunkedUpload,
  isFolderUpload,
  isRegularUpload,
  UploadStatus,
} from 'src/types/localTypes';

/**
 * Upload Store - Handles file uploads including chunked uploads for large files
 *
 * ## Features
 * - Regular uploads for files < 50MB
 * - Chunked uploads for files >= 50MB
 * - Progress tracking and error handling
 * - Unified upload list for both types
 * - Sequential file uploads (but parallel chunk uploads)
 *
 * ## File Size Limits
 * - **Regular uploads**: Files under 50MB
 * - **Chunked uploads**: Files 50MB and larger
 * - **Maximum size**: 50GB per file
 */
export const useUploadStore = defineStore('upload', () => {
  const q = useQuasar();
  const fileOps = useFileOperationsStore();
  const chunkedUpload = useChunkedUpload();
  const folderUpload = useFolderUpload();

  // Constants
  const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50GB
  const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB

  // ========================================
  // STATE
  // ========================================

  const uploadPreviewList = ref<UploadPreviewEntry[]>([]);
  const uploadProgressList = ref<AnyUploadProgressEntry[]>([]);

  // Queue management - improved
  const uploadQueue = ref<AnyUploadProgressEntry[]>([]);
  const isProcessorActive = ref(false);
  const maxConcurrentUploads = ref(3);

  // Add this new state for better control
  const processingScheduled = ref(false);

  // UI state
  const uploadDialogOpen = ref(false);
  const showProgressDialog = ref(false);

  // ========================================
  // COMPUTED PROPERTIES
  // ========================================

  const hasUploads = computed(() => uploadPreviewList.value.length > 0);
  const uploadInProgress = computed(() => hasActiveUploads.value);
  const hasActiveUploads = computed(() =>
    uploadProgressList.value.some((upload) =>
      [UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status),
    ),
  );

  const queuedUploads = computed(() =>
    uploadQueue.value.filter((upload) => upload.status === UploadStatus.QUEUED),
  );

  const activeUploads = computed(() =>
    uploadProgressList.value.filter((upload) =>
      [UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status),
    ),
  );

  const hasActiveRegularUploads = computed(() =>
    uploadProgressList.value.some(
      (upload) => isRegularUpload(upload) && upload.status === UploadStatus.UPLOADING,
    ),
  );

  const hasActiveChunkedUploads = computed(() =>
    uploadProgressList.value.some(
      (upload) =>
        isChunkedUpload(upload) &&
        [UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status),
    ),
  );

  const completedUploads = computed(() =>
    uploadProgressList.value.filter((upload) => upload.status === UploadStatus.COMPLETED),
  );

  const failedUploads = computed(() =>
    uploadProgressList.value.filter((upload) => upload.status === UploadStatus.FAILED),
  );

  const totalUploadProgress = computed(() => {
    if (uploadProgressList.value.length === 0) return 0;

    const totalBytes = uploadProgressList.value.reduce((sum, upload) => sum + upload.sizeBytes, 0);
    const uploadedBytes = uploadProgressList.value.reduce(
      (sum, upload) => sum + upload.uploadedBytes,
      0,
    );

    return totalBytes > 0 ? uploadedBytes / totalBytes : 0;
  });

  // ========================================
  // IMPROVED QUEUE PROCESSOR
  // ========================================

  /**
   * Process uploads when needed (event-driven with smart polling)
   */
  function processUploads(): void {
    // Avoid recursive processing
    if (isProcessorActive.value) return;

    isProcessorActive.value = true;
    processingScheduled.value = false;

    try {
      const activeCount = activeUploads.value.length;
      const availableSlots = maxConcurrentUploads.value - activeCount;

      if (availableSlots > 0 && queuedUploads.value.length > 0) {
        const uploadsToStart = queuedUploads.value.slice(0, availableSlots);

        for (const upload of uploadsToStart) {
          // Use ID for unique identification, not name
          const queueIndex = uploadQueue.value.findIndex((u) => u.id === upload.id);
          if (queueIndex !== -1 && upload.status === UploadStatus.QUEUED) {
            uploadQueue.value.splice(queueIndex, 1);
            uploadProgressList.value.push(upload);
            executeUpload(upload).catch((error) => {
              console.error(`Upload failed for ${upload.name} (ID: ${upload.id}):`, error);
            });
          }
        }
      }
    } finally {
      isProcessorActive.value = false;
    }
  }

  /**
   * Trigger upload processing with smart scheduling
   */
  function triggerUploadProcessing(): void {
    // If processing is already scheduled, don't schedule again
    if (processingScheduled.value) return;

    // Use nextTick to avoid immediate recursive calls
    processingScheduled.value = true;
    nextTick(() => {
      try {
        processUploads();

        // Only schedule next processing if:
        // 1. There are still queued items
        // 2. There are available slots
        // 3. No processing is already scheduled
        // 4. Add a reasonable limit to prevent infinite scheduling
        const shouldContinue =
          queuedUploads.value.length > 0 &&
          activeUploads.value.length < maxConcurrentUploads.value &&
          !isProcessorActive.value;

        if (shouldContinue) {
          // Schedule next check after a reasonable delay
          setTimeout(() => {
            if (queuedUploads.value.length > 0) {
              // Double-check before scheduling
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

  /**
   * Execute a single upload (regular or chunked) - IMPROVED
   */
  async function executeUpload(upload: AnyUploadProgressEntry): Promise<void> {
    try {
      let success = false;

      if (isRegularUpload(upload)) {
        success = await executeRegularUpload(upload);
      } else if (isChunkedUpload(upload)) {
        success = await executeChunkedUpload(upload);
      } else if (isFolderUpload(upload)) {
        success = await executeFolderUpload(upload);
      }
      if (success) {
        q.notify({ type: 'positive', message: `Upload completed` });
      }
    } catch (error: any) {
      console.error(`Upload execution failed for ${upload.name}:`, error);
      upload.status = UploadStatus.FAILED;
      upload.message = error.message || 'Upload failed';
    } finally {
      // Always trigger processing when an upload slot becomes available
      // Use a small delay to ensure state updates are complete
      setTimeout(() => {
        triggerUploadProcessing();
      }, 250);
    }
  }

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  function validName(name: string): boolean {
    if (name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Name must be at least 1 character long.',
      });
      return false;
    }

    if (name.includes('/') || name.includes('\x00')) {
      q.notify({
        type: 'negative',
        message: 'Name contains invalid characters.',
      });
      return false;
    }

    if (!nameAvailable(name)) {
      q.notify({
        type: 'negative',
        message: 'Item with same name already exists in upload list',
      });
      return false;
    }

    return true;
  }

  // Fix nameAvailable to check ALL upload states
  function nameAvailable(name: string): boolean {
    // Check preview list
    if (uploadPreviewList.value.some((el) => el.name === name)) {
      return false;
    }

    // Check active progress list
    if (uploadProgressList.value.some((el) => el.name === name)) {
      return false;
    }

    // Check queue
    if (uploadQueue.value.some((el) => el.name === name)) {
      return false;
    }

    // Check existing files in current folder
    if (fileOps.rawFolderContent.children.some((el) => el.name === name)) {
      return false;
    }

    return true;
  }

  /**
   * Find a valid name for a file or folder
   *
   * If the name already exists, add (1), (2), etc. until a unique name is found
   *
   * @param originalName The original name to check and potentially modify
   * @param type 'file' or 'folder' - affects how extensions are handled
   * @returns A valid, unique name
   */
  function findAvailableName(originalName: string, type: 'file' | 'folder'): string {
    if (nameAvailable(originalName)) {
      return originalName;
    }

    if (type === 'file') {
      let nameWithoutExtension = originalName;
      let extension = '';

      if (originalName.indexOf('.') > 0) {
        extension = originalName.substring(originalName.lastIndexOf('.'));
        nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
      }

      const parenthesisRegex = /\((\d+)\)$/;
      const match = nameWithoutExtension.match(parenthesisRegex);

      let counter = 1;
      let newName = '';

      if (match) {
        counter = parseInt(match[1]!, 10) + 1;
        nameWithoutExtension = nameWithoutExtension.replace(parenthesisRegex, '');
      }

      do {
        newName = `${nameWithoutExtension}(${counter})${extension}`;
        counter++;
      } while (!nameAvailable(newName));

      return newName;
    } else {
      const parenthesisRegex = /\((\d+)\)$/;
      const match = originalName.match(parenthesisRegex);

      let counter = 1;
      let nameBase = originalName;
      let newName = '';

      if (match) {
        counter = parseInt(match[1]!, 10) + 1;
        nameBase = originalName.replace(parenthesisRegex, '');
      }

      do {
        newName = `${nameBase}(${counter})`;
        counter++;
      } while (!nameAvailable(newName));

      return newName;
    }
  }

  // ========================================
  // UPLOAD PREVIEW METHODS
  // ========================================

  /**
   * Add a file or folder to the upload preview list
   *
   * @param entry - File or FileSystemEntry to add
   * @param type - 'file' or 'folder'
   */
  function addUploadEntry(
    entry: File | FileSystemEntry,
    type: 'file' | 'folder',
    parentId: string,
  ): void {
    const name = entry.name;

    if (name.includes('/') || name.includes('\x00') || name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Item has an invalid name',
      });
      return;
    }

    if (type === 'file' && entry instanceof File) {
      const validName = findAvailableName(name, type);
      uploadPreviewList.value.push({
        name: validName,
        type: 'file',
        parentId: parentId,
        content: entry,
        edit: false,
        edit_name: '',
      });
    } else if (type === 'folder' && entry instanceof FileSystemDirectoryEntry) {
      const validName = findAvailableName(name, type);
      uploadPreviewList.value.push({
        name: validName,
        type: 'folder',
        parentId: parentId,
        content: entry,
        edit: false,
        edit_name: '',
      });
    }
  }

  // Fix removeUploadEntry to also check queue and progress (if needed)
  function removeUploadEntry(name: string): void {
    // Remove from preview list
    uploadPreviewList.value = uploadPreviewList.value.filter((item) => item.name !== name);

    // Also remove from queue if it exists there (edge case)
    uploadQueue.value = uploadQueue.value.filter((item) => item.name !== name);
  }

  // Add a new method to remove by ID (more reliable)
  function removeUploadById(id: string): void {
    // Remove from preview list (shouldn't have IDs, but for completeness)
    uploadPreviewList.value = uploadPreviewList.value.filter(
      (item) => !('id' in item) || item.id !== id,
    );

    // Remove from queue
    uploadQueue.value = uploadQueue.value.filter((item) => item.id !== id);

    // Remove from progress list
    uploadProgressList.value = uploadProgressList.value.filter((item) => item.id !== id);
  }

  /**
   * Clear the upload preview list
   */
  function clearUploadList(): void {
    uploadPreviewList.value = [];
  }

  /**
   * Handle file name changes inside the upload preview list
   */
  function changeFileName(file: UploadPreviewEntry): boolean {
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

  // ========================================
  // UPLOAD PREPARATION METHODS
  // ========================================

  // Fix createUploadProgressEntries to ensure unique names
  function createUploadProgressEntries(): AnyUploadProgressEntry[] {
    const progressEntries: AnyUploadProgressEntry[] = [];

    for (const item of uploadPreviewList.value) {
      const uploadId = generateUniqueUploadId();
      if (item.type === 'file' && item.content instanceof File) {
        const file = item.content;
        // Check file size limits
        if (file.size > MAX_FILE_SIZE) {
          q.notify({
            type: 'negative',
            message: `File "${item.name}" exceeds the maximum upload limit of ${fileSizeDecimal(MAX_FILE_SIZE)}.`,
          });
          continue;
        }

        // Create appropriate progress entry based on file size
        if (file.size >= CHUNKED_UPLOAD_THRESHOLD) {
          // Create chunked upload entry
          const chunkedEntry: ChunkedUploadProgressEntry = reactive({
            id: uploadId,
            name: item.name, // Use validated name
            parentId: item.parentId,
            type: 'file',
            content: file,
            mimeType: file.type,
            sizeBytes: file.size,
            status: UploadStatus.QUEUED,
            message: 'Queued for upload...',
            uploadedBytes: 0,
            uploadSpeed: 0,
            chunks: [],
          });

          progressEntries.push(chunkedEntry);
        } else {
          // Create regular upload entry
          const source = axios.CancelToken.source();
          const regularEntry: RegularUploadProgressEntry = reactive({
            id: uploadId,
            name: item.name, // Use validated name
            parentId: item.parentId,
            type: 'file',
            content: file,
            mimeType: file.type,
            sizeBytes: file.size,
            status: UploadStatus.QUEUED,
            message: 'Queued for upload...',
            uploadedBytes: 0,
            uploadSpeed: 0,
            cancelToken: source,
          });

          progressEntries.push(regularEntry);
        }
      } else if (item.type === 'folder' && item.content instanceof FileSystemDirectoryEntry) {
        const folder = item.content;
        const folderEntry: FolderUploadProgressEntry = reactive({
          id: uploadId,
          name: item.name, // Use validated name
          parentId: item.parentId,
          type: 'folder',
          content: folder,
          mimeType: 'inode/directory',
          sizeBytes: 0,
          status: UploadStatus.QUEUED,
          message: 'Queued for upload...',
          uploadedBytes: 0,
          uploadSpeed: 0,
          // trackers
          structureInitialized: false,
          foldersInitialized: false,
          nodes: [] as AnyTrackerNode[],
          nodeProgressTypeMap: new Map<
            string,
            RegularUploadProgressEntry | ChunkedUploadProgressEntry
          >(),
        });
        progressEntries.push(folderEntry);
      }
    }

    return progressEntries;
  }

  // ========================================
  // UPLOAD EXECUTION METHODS
  // ========================================

  /**
   * Start uploading from dialog - now with sequential processing
   */
  function uploadFromPreviewList(): void {
    if (uploadPreviewList.value.length === 0) return;

    uploadDialogOpen.value = false;
    showProgressDialog.value = true;

    try {
      // Create all upload progress entries first
      const progressEntries = createUploadProgressEntries();

      // Add all entries to the queue
      uploadQueue.value.push(...progressEntries);

      // Clear the preview list immediately so user can add more files
      clearUploadList();

      // Trigger processing immediately
      triggerUploadProcessing();
    } catch (error: any) {
      q.notify({
        type: 'negative',
        message: error.message || 'Upload failed',
      });
    }
  }

  /**
   * Execute a regular upload
   */
  async function executeRegularUpload(upload: RegularUploadProgressEntry): Promise<boolean> {
    const formData = new FormData();
    formData.append('name', upload.name);
    formData.append('parent_id', upload.parentId);
    formData.append('node_type', 'file');
    formData.append('file_content', upload.content);

    try {
      upload.status = UploadStatus.PREPARING;
      upload.message = 'Preparing upload...';

      upload.status = UploadStatus.UPLOADING;
      upload.message = 'Uploading...';

      const config = {
        withCredentials: true,
        onUploadProgress: (progressEvent: ProgressEvent) => {
          upload.uploadedBytes = progressEvent.loaded;
        },
        cancelToken: upload.cancelToken.token,
        headers: {
          'X-CSRFToken': q.cookies.get('csrftoken'),
        },
      };

      console.log(`Starting upload for ${upload.name} (${fileSizeDecimal(upload.sizeBytes)})`);

      const apiData = await apiPost('files/nodes/', formData, config);

      if (apiData.error === false) {
        upload.status = UploadStatus.COMPLETED;
        upload.uploadedBytes = upload.sizeBytes;
        upload.message = 'Upload completed';
        await fileOps.refreshFolder();
        return true;
      } else {
        upload.status = UploadStatus.FAILED;
        upload.message = apiData.errorMessage || 'Upload failed';
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        upload.status = UploadStatus.CANCELED;
        upload.message = 'Upload canceled';
      } else {
        upload.status = UploadStatus.FAILED;
        upload.message = error.message || 'Upload failed';
      }
    }
    return false;
  }

  /**
   * Execute a chunked upload
   */
  async function executeChunkedUpload(upload: ChunkedUploadProgressEntry): Promise<boolean> {
    try {
      upload.status = UploadStatus.PREPARING;
      upload.message = 'Initializing chunked upload...';

      // Initialize chunked upload
      await chunkedUpload.initUpload(upload);

      // Start upload and await completion
      await chunkedUpload.startUpload(upload);

      // Upload completed successfully
      upload.status = UploadStatus.COMPLETED;
      upload.uploadedBytes = upload.sizeBytes;
      upload.message = 'Upload completed';

      // Refresh folder
      await fileOps.refreshFolder();

      q.notify({
        type: 'positive',
        message: `Upload completed: ${upload.name}`,
        timeout: 3000,
      });

      return true;
    } catch (error: any) {
      upload.status = UploadStatus.FAILED;
      upload.message = error.message || 'Chunked upload failed';
      q.notify({
        type: 'negative',
        message: `Upload failed: ${upload.name} - ${error.message}`,
        timeout: 5000,
      });

      return false;
    }
  }

  async function executeFolderUpload(upload: FolderUploadProgressEntry): Promise<boolean> {
    try {
      upload.message = 'Processing folder...';

      console.log(`Starting folder upload for ${upload.name}`);
      // create basic structure
      const structureSuccess = await folderUpload.initializeStructure(upload);
      if (!structureSuccess) {
        upload.status = UploadStatus.FAILED;
        upload.message = 'Failed to initialize folder structure';
        q.notify({
          type: 'negative',
          message: `Folder processing failed: ${upload.name}`,
        });
        return false;
      }

      console.log(`Folder ${upload.name} has ${upload.nodes.length} nodes`);

      upload.structureInitialized = true;

      upload.message = 'Creating folder structure...';
      // create folders
      const folderSuccess = await folderUpload.initializeFolders(upload);
      if (!folderSuccess) {
        upload.status = UploadStatus.FAILED;
        upload.message = 'Failed creating folder structure';
        q.notify({
          type: 'negative',
          message: `Folder creation failed: ${upload.name}`,
        });
        return false;
      }
      upload.foldersInitialized = true;

      upload.message = 'Assigning folders...';
      const assignSuccess = folderUpload.assignRemoteParentIds(upload);
      if (!assignSuccess) {
        upload.status = UploadStatus.FAILED;
        upload.message = 'Failed assigning folders';
        q.notify({
          type: 'negative',
          message: `Folder creation failed: ${upload.name}`,
        });
        return false;
      }

      const fileUploadEntries = folderUpload.createFileUploadEntries(upload);
      console.log(
        `Created ${fileUploadEntries.length} file upload entries for folder ${upload.name}`,
      );

      upload.message = 'Uploading files...';
      uploadQueue.value.push(...fileUploadEntries);

      folderUpload.trackFolderCompletion(upload, {
        onProgress: (completed, total, failed, canceled) => {
          upload.message = `${completed}/${total} files uploaded${failed > 0 ? ` (${failed} failed)` : ''}`;
          upload.uploadedBytes = Math.floor((completed / total) * upload.sizeBytes);
        },
        onComplete: (completed, total, failed, canceled) => {
          if (failed > 0) {
            upload.status = UploadStatus.FAILED;
          } else {
            upload.status = UploadStatus.COMPLETED;
          }
        },
      });

      // return true;
    } catch (error: any) {
      console.error(`Folder upload failed for ${upload.name}:`, error);
      upload.status = UploadStatus.FAILED;
      upload.message = error.message || 'Folder processing failed';

      q.notify({
        type: 'negative',
        message: `Folder processing failed: ${upload.name} - ${error.message}`,
        timeout: 5000,
      });

      return false;
    }
  }

  // ========================================
  // UPLOAD CONTROL METHODS
  // ========================================

  /**
   * Cancel any upload by ID
   *
   * @param uploadId - The ID of the upload to cancel
   */
  async function cancelUpload(uploadId: string): Promise<void> {
    // Check if it's in the queue
    const queueIndex = uploadQueue.value.findIndex((u) => u.id === uploadId);
    if (queueIndex !== -1) {
      const upload = uploadQueue.value[queueIndex]!;
      upload.status = UploadStatus.CANCELED;
      upload.message = 'Canceled';

      // Move to progress list for display
      uploadQueue.value.splice(queueIndex, 1);
      uploadProgressList.value.push(upload);

      // Trigger processing to handle remaining queue
      triggerUploadProcessing();
      return;
    }

    // Check if it's in active uploads
    const upload = uploadProgressList.value.find((u) => u.id === uploadId);
    if (!upload) return;

    if (isFolderUpload(upload)) {
      // Cancel folder upload
      upload.status = UploadStatus.CANCELED;
      upload.message = 'Folder upload canceled';
    } else if (isRegularUpload(upload)) {
      upload.status = UploadStatus.CANCELED;
      upload.message = 'Upload canceled';
      upload.cancelToken.cancel('Upload canceled by user');
    } else if (isChunkedUpload(upload)) {
      upload.status = UploadStatus.CANCELED;
      upload.message = 'Upload canceled';
      await chunkedUpload.cancelUpload(upload);
    }

    // Trigger processing to handle remaining queue
    triggerUploadProcessing();
  }

  /**
   * Retry a failed upload
   */
  async function retryUpload(uploadId: string): Promise<void> {
    try {
      const upload = uploadProgressList.value.find((u) => u.id === uploadId);
      if (!upload) {
        throw new Error('Upload not found');
      }

      // Reset status
      upload.status = UploadStatus.QUEUED;
      upload.message = 'Queued for retry...';
      upload.uploadedBytes = 0;

      // Reset chunks if it's a chunked upload
      if (isChunkedUpload(upload)) {
        upload.chunks = [];
        delete upload.sessionInfo;
      }

      // Remove from progress list and add back to queue
      const progressIndex = uploadProgressList.value.findIndex((u) => u.id === uploadId);
      if (progressIndex !== -1) {
        uploadProgressList.value.splice(progressIndex, 1);
        uploadQueue.value.unshift(upload);
      }

      // Trigger processing
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
  // CLEANUP METHODS
  // ========================================

  /**
   * Clear completed uploads
   */
  function clearCompletedUploads(): void {
    uploadProgressList.value = uploadProgressList.value.filter(
      (upload) => upload.status !== UploadStatus.COMPLETED,
    );
  }

  /**
   * Enhanced cleanup that stops processing
   */
  async function clearAllUploads(): Promise<void> {
    console.log('Clearing all uploads...');

    // Stop any scheduled processing
    processingScheduled.value = false;
    isProcessorActive.value = false;

    // Cancel active uploads first
    const activePromises: Promise<void>[] = [];

    uploadProgressList.value.forEach((upload) => {
      if ([UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status)) {
        if (isRegularUpload(upload)) {
          upload.cancelToken.cancel('Upload canceled');
          upload.status = UploadStatus.CANCELED;
          upload.message = 'Canceled';
        } else if (isChunkedUpload(upload)) {
          upload.status = UploadStatus.CANCELED;
          upload.message = 'Canceled';
          activePromises.push(chunkedUpload.cancelUpload(upload).catch(console.error));
        } else if (isFolderUpload(upload)) {
          upload.status = UploadStatus.CANCELED;
          upload.message = 'Canceled';
        }
      }
    });

    // Cancel queued uploads
    uploadQueue.value.forEach((upload) => {
      upload.status = UploadStatus.CANCELED;
      upload.message = 'Canceled';
    });

    // Wait for chunked upload cancellations (with timeout)
    if (activePromises.length > 0) {
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 5000); // 5 second timeout
      });

      await Promise.race([Promise.allSettled(activePromises), timeoutPromise]);
    }

    // Clear everything
    uploadProgressList.value = [];
    uploadQueue.value = [];
    showProgressDialog.value = false;

    q.notify({
      type: 'info',
      message: 'All uploads have been canceled',
    });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get upload statistics
   */
  function getUploadStats() {
    const allUploads = [...uploadQueue.value, ...uploadProgressList.value];

    return {
      total: allUploads.length,
      queued: uploadQueue.value.filter((u) => u.status === UploadStatus.QUEUED).length,
      active: uploadProgressList.value.filter((u) =>
        [UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(u.status),
      ).length,
      completed: uploadProgressList.value.filter((u) => u.status === UploadStatus.COMPLETED).length,
      failed: uploadProgressList.value.filter((u) => u.status === UploadStatus.FAILED).length,
      canceled: allUploads.filter((u) => u.status === UploadStatus.CANCELED).length,
    };
  }

  // ========================================
  // RETURN STORE INTERFACE
  // ========================================

  return {
    // State
    uploadPreviewList,
    uploadProgressList,
    uploadQueue,
    uploadInProgress,
    uploadDialogOpen,
    showProgressDialog,
    maxConcurrentUploads,

    // Computed
    hasUploads,
    hasActiveUploads,
    hasActiveRegularUploads,
    hasActiveChunkedUploads,
    completedUploads,
    failedUploads,
    totalUploadProgress,
    queuedUploads,
    activeUploads,

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

    // Constants
    CHUNKED_UPLOAD_THRESHOLD,
  };
});
