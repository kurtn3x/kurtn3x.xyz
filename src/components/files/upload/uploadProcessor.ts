import { useQuasar } from 'quasar';
import axios from 'axios';
import { apiPost } from 'src/api/apiWrapper';
import { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import { useChunkedUpload } from 'src/components/files/upload/chunkedUpload';
import { useFolderUpload } from 'src/components/files/upload/folderUpload';
import { fileSizeDecimal } from 'src/components/lib/functions';
import type {
  ChunkedUploadProgressEntry,
  FolderUploadProgressEntry,
  RegularUploadProgressEntry,
} from 'src/types/localTypes';
import { UploadStatus } from 'src/types/localTypes';

export function useUploadProcessor() {
  const q = useQuasar();
  const chunkedUpload = useChunkedUpload();
  const folderUpload = useFolderUpload();
  const fileOps = useFileOperationsStore();

  /**
   * Execute a regular file upload
   */
  const executeRegularUpload = async (upload: RegularUploadProgressEntry): Promise<boolean> => {
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
  };

  /**
   * Execute a chunked file upload
   */
  const executeChunkedUpload = async (upload: ChunkedUploadProgressEntry): Promise<boolean> => {
    try {
      upload.status = UploadStatus.PREPARING;
      upload.message = 'Initializing chunked upload...';

      await chunkedUpload.initUpload(upload);
      await chunkedUpload.startUpload(upload);

      upload.status = UploadStatus.COMPLETED;
      upload.uploadedBytes = upload.sizeBytes;
      upload.message = 'Upload completed';

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
  };

  /**
   * Execute a folder upload
   */
  const executeFolderUpload = async (
    upload: FolderUploadProgressEntry,
    addToQueue: (entries: any[]) => void,
  ): Promise<boolean> => {
    try {
      upload.message = 'Processing folder...';

      console.log(`Starting folder upload for ${upload.name}`);

      // Initialize structure
      if (!upload.structureInitialized) {
        upload.status = UploadStatus.PREPARING;
        upload.message = 'Initializing folder structure...';

        const structureSuccess = await folderUpload.initializeStructure(upload);
        if (!structureSuccess) {
          upload.status = UploadStatus.FAILED;
          upload.message = 'Failed to initialize folder structure';
          return false;
        }
        upload.structureInitialized = true;
      }

      console.log(`Folder ${upload.name} has ${upload.nodes.length} nodes`);

      if (!upload.foldersInitialized) {
        upload.message = 'Creating folders...';

        const folderSuccess = await folderUpload.initializeFolders(upload);
        if (!folderSuccess) {
          upload.status = UploadStatus.FAILED;
          upload.message = 'Failed to create folders';
          return false;
        }
        upload.foldersInitialized = true;

        const assignSuccess = folderUpload.assignRemoteParentIds(upload);
        if (!assignSuccess) {
          upload.status = UploadStatus.FAILED;
          upload.message = 'Failed to assign folder IDs';
          return false;
        }
      }

      // Create file upload entries
      const fileUploadEntries = folderUpload.createFileUploadEntries(upload);
      console.log(
        `Created ${fileUploadEntries.length} file upload entries for folder ${upload.name}`,
      );

      if (fileUploadEntries.length === 0) {
        // No files to upload, folder is complete
        upload.status = UploadStatus.COMPLETED;
        upload.message = 'Folder created (no files to upload)';
        return true;
      }

      upload.status = UploadStatus.UPLOADING;
      upload.message = `Uploading ${fileUploadEntries.length} files...`;
      addToQueue(fileUploadEntries);

      // Track completion
      folderUpload.trackFolderCompletion(upload, {
        onProgress: (completed, total, failed) => {
          upload.message = `${completed}/${total} files uploaded${failed > 0 ? ` (${failed} failed)` : ''}`;
          upload.uploadedBytes = Math.floor((completed / total) * upload.sizeBytes);
        },
        onComplete: (completed, total, failed) => {
          upload.status = failed > 0 ? UploadStatus.FAILED : UploadStatus.COMPLETED;
        },
      });

      return true;
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
  };

  /**
   * Get upload progress percentage for any upload type
   */
  const getUploadProgress = (
    upload: RegularUploadProgressEntry | ChunkedUploadProgressEntry | FolderUploadProgressEntry,
  ): number => {
    if (upload.sizeBytes === 0) return 0;
    return Math.min(100, (upload.uploadedBytes / upload.sizeBytes) * 100);
  };

  /**
   * Cancel any type of upload
   */
  const cancelUpload = async (
    upload: RegularUploadProgressEntry | ChunkedUploadProgressEntry | FolderUploadProgressEntry,
  ): Promise<void> => {
    try {
      if ('cancelToken' in upload) {
        // Regular upload
        upload.cancelToken.cancel('Upload canceled by user');
      } else if ('chunks' in upload) {
        // Chunked upload
        await chunkedUpload.cancelUpload(upload);
      } else if ('nodeProgressTypeMap' in upload) {
        // Folder upload
        await folderUpload.cancelFolderUpload(upload);
      }

      upload.status = UploadStatus.CANCELED;
      upload.message = 'Upload canceled';
    } catch (error: any) {
      console.error(`Error canceling upload ${upload.name}:`, error);
    }
  };

  /**
   * Retry a failed upload
   */
  const retryUpload = (
    upload: RegularUploadProgressEntry | ChunkedUploadProgressEntry | FolderUploadProgressEntry,
  ): boolean => {
    if (upload.status !== UploadStatus.FAILED) {
      return false;
    }

    // Reset upload state
    upload.status = UploadStatus.QUEUED;
    upload.message = 'Queued for retry...';
    upload.uploadedBytes = 0;

    // Reset type-specific properties
    if ('chunks' in upload) {
      upload.chunks = [];
      delete upload.sessionInfo;
    }

    if ('cancelToken' in upload) {
      upload.cancelToken = axios.CancelToken.source();
    }

    if ('nodeProgressTypeMap' in upload) {
      upload.structureInitialized = false;
      upload.foldersInitialized = false;
      upload.nodes = [];
      upload.nodeProgressTypeMap.clear();
    }

    return true;
  };

  /**
   * Get upload summary statistics
   */
  const getUploadSummary = (
    uploads: Array<
      RegularUploadProgressEntry | ChunkedUploadProgressEntry | FolderUploadProgressEntry
    >,
  ) => {
    const summary = {
      total: uploads.length,
      completed: 0,
      failed: 0,
      uploading: 0,
      queued: 0,
      canceled: 0,
      totalBytes: 0,
      uploadedBytes: 0,
    };

    uploads.forEach((upload) => {
      summary.totalBytes += upload.sizeBytes;
      summary.uploadedBytes += upload.uploadedBytes;

      switch (upload.status) {
        case UploadStatus.COMPLETED:
          summary.completed++;
          break;
        case UploadStatus.FAILED:
          summary.failed++;
          break;
        case UploadStatus.UPLOADING:
        case UploadStatus.PREPARING:
          summary.uploading++;
          break;
        case UploadStatus.QUEUED:
          summary.queued++;
          break;
        case UploadStatus.CANCELED:
          summary.canceled++;
          break;
      }
    });

    return summary;
  };

  return {
    // Core execution functions
    executeRegularUpload,
    executeChunkedUpload,
    executeFolderUpload,

    // Utility functions
    getUploadProgress,
    cancelUpload,
    retryUpload,
    getUploadSummary,

    // Access to underlying composables if needed
    chunkedUpload,
    folderUpload,
    fileOps,
  };
}
