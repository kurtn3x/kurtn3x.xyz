import type { useQuasar } from 'quasar';
import axios from 'axios';
import type { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import type { AnyUploadProgressEntry, UploadPreviewEntry } from 'src/types/localTypes';
import {
  isChunkedUpload,
  isFolderUpload,
  isRegularUpload,
  UploadStatus,
} from 'src/types/localTypes';

/**
 * Upload status management utilities
 */
export const uploadStatusUtils = {
  markAsCanceled(upload: AnyUploadProgressEntry): void {
    upload.status = UploadStatus.CANCELED;
    upload.message = 'Canceled by user';
  },

  markAsQueued(upload: AnyUploadProgressEntry): void {
    upload.status = UploadStatus.QUEUED;
    upload.message = 'Queued for retry...';
    upload.uploadedBytes = 0;
  },

  markAsFailed(upload: AnyUploadProgressEntry, message?: string): void {
    upload.status = UploadStatus.FAILED;
    upload.message = message || 'Upload failed';
  },

  markAsCompleted(upload: AnyUploadProgressEntry): void {
    upload.status = UploadStatus.COMPLETED;
    upload.uploadedBytes = upload.sizeBytes;
    upload.message = 'Upload completed';
  },

  resetForRetry(upload: AnyUploadProgressEntry): void {
    this.markAsQueued(upload);

    // Reset type-specific properties
    if (isChunkedUpload(upload)) {
      upload.chunks = [];
      delete upload.sessionInfo;
    }

    if (isRegularUpload(upload)) {
      upload.cancelToken = axios.CancelToken.source();
    }

    if (isFolderUpload(upload)) {
      // Reset folder-specific properties
      upload.structureInitialized = false;
      upload.foldersInitialized = false;
      upload.nodes = [];
      upload.nodeProgressTypeMap.clear();
    }
  },
};

/**
 * Upload type detection utilities
 */
export const uploadTypeUtils = {
  isActive(this: void, upload: AnyUploadProgressEntry): boolean {
    return [UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(upload.status);
  },

  isQueued(this: void, upload: AnyUploadProgressEntry): boolean {
    return upload.status === UploadStatus.QUEUED;
  },

  isCancelable(this: void, upload: AnyUploadProgressEntry): boolean {
    return [UploadStatus.QUEUED, UploadStatus.UPLOADING, UploadStatus.PREPARING].includes(
      upload.status,
    );
  },

  isRetryable(this: void, upload: AnyUploadProgressEntry): boolean {
    return upload.status === UploadStatus.FAILED;
  },
};

export class UploadHelpers {
  constructor(
    private q: ReturnType<typeof useQuasar>,
    private fileOps: ReturnType<typeof useFileOperationsStore>,
    private uploadLists: {
      preview: UploadPreviewEntry[];
      progress: any[];
      queue: any[];
    },
  ) {}

  /**
   * Validate upload name
   */
  validName(name: string): boolean {
    if (name.length < 1) {
      this.q.notify({
        type: 'negative',
        message: 'Name must be at least 1 character long.',
      });
      return false;
    }

    if (name.includes('/') || name.includes('\x00')) {
      this.q.notify({
        type: 'negative',
        message: 'Name contains invalid characters.',
      });
      return false;
    }

    if (!this.nameAvailable(name)) {
      this.q.notify({
        type: 'negative',
        message: 'Item with same name already exists in upload list',
      });
      return false;
    }

    return true;
  }

  /**
   * Check if name is available across all upload states
   */
  nameAvailable(name: string): boolean {
    // Check preview list
    if (this.uploadLists.preview.some((el) => el.name === name)) {
      return false;
    }

    // Check active progress list
    if (this.uploadLists.progress.some((el) => el.name === name)) {
      return false;
    }

    // Check queue
    if (this.uploadLists.queue.some((el) => el.name === name)) {
      return false;
    }

    // Check existing files in current folder
    if (this.fileOps.rawFolderContent.children.some((el) => el.name === name)) {
      return false;
    }

    return true;
  }

  /**
   * Find available name with automatic numbering
   */
  findAvailableName(originalName: string, type: 'file' | 'folder'): string {
    if (this.nameAvailable(originalName)) {
      return originalName;
    }

    if (type === 'file') {
      return this.findAvailableFileName(originalName);
    } else {
      return this.findAvailableFolderName(originalName);
    }
  }

  private findAvailableFileName(originalName: string): string {
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
    } while (!this.nameAvailable(newName));

    return newName;
  }

  private findAvailableFolderName(originalName: string): string {
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
    } while (!this.nameAvailable(newName));

    return newName;
  }
}
