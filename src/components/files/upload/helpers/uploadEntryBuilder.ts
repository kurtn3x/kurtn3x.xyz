import { reactive } from 'vue';
import axios from 'axios';
import { generateUniqueUploadId } from 'src/components/lib/functions';
import type {
  AnyTrackerNode,
  AnyUploadProgressEntry,
  ChunkedUploadProgressEntry,
  FolderUploadProgressEntry,
  RegularUploadProgressEntry,
  UploadPreviewEntry,
} from 'src/types/localTypes';
import { UploadStatus } from 'src/types/localTypes';

// Constants - can be exported separately if needed elsewhere
export const UPLOAD_CONSTANTS = {
  CHUNKED_UPLOAD_THRESHOLD: 50 * 1024 * 1024, // 50MB
  MAX_FILE_SIZE: 50 * 1024 * 1024 * 1024, // 50GB
} as const;

export function useUploadEntryBuilder() {
  /**
   * Validate upload item before creating entry
   */
  const validateUploadItem = (item: UploadPreviewEntry): { valid: boolean; error?: string } => {
    // Name validation
    if (!item.name || item.name.length < 1) {
      return { valid: false, error: 'Name must be at least 1 character long' };
    }

    if (item.name.includes('/') || item.name.includes('\x00')) {
      return { valid: false, error: 'Name contains invalid characters' };
    }

    // File-specific validation
    if (item.type === 'file' && item.content instanceof File) {
      if (item.content.size > UPLOAD_CONSTANTS.MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `File exceeds maximum upload limit of ${UPLOAD_CONSTANTS.MAX_FILE_SIZE} bytes`,
        };
      }
    }

    return { valid: true };
  };

  /**
   * Get upload type based on content and size
   */
  const getUploadType = (item: UploadPreviewEntry): 'regular' | 'chunked' | 'folder' => {
    if (item.type === 'folder') {
      return 'folder';
    }

    if (item.type === 'file' && item.content instanceof File) {
      return item.content.size >= UPLOAD_CONSTANTS.CHUNKED_UPLOAD_THRESHOLD ? 'chunked' : 'regular';
    }

    throw new Error('Unknown upload item type');
  };

  /**
   * Create a file upload entry (regular or chunked based on size)
   */
  const createFileUploadEntry = (
    uploadId: string,
    item: UploadPreviewEntry,
  ): RegularUploadProgressEntry | ChunkedUploadProgressEntry => {
    const file = item.content as File;

    // Validate file size
    if (file.size > UPLOAD_CONSTANTS.MAX_FILE_SIZE) {
      throw new Error(
        `File exceeds maximum upload limit of ${UPLOAD_CONSTANTS.MAX_FILE_SIZE} bytes`,
      );
    }

    const baseEntry = {
      id: uploadId,
      name: item.name,
      parentId: item.parentId,
      type: 'file' as const,
      content: file,
      mimeType: file.type,
      sizeBytes: file.size,
      status: UploadStatus.QUEUED,
      message: 'Queued for upload...',
      uploadedBytes: 0,
      uploadSpeed: 0,
    };

    // Create chunked upload for large files
    if (file.size >= UPLOAD_CONSTANTS.CHUNKED_UPLOAD_THRESHOLD) {
      return reactive({
        ...baseEntry,
        chunks: [],
      } as ChunkedUploadProgressEntry);
    }

    // Create regular upload for smaller files
    return reactive({
      ...baseEntry,
      cancelToken: axios.CancelToken.source(),
    } as RegularUploadProgressEntry);
  };

  /**
   * Create a folder upload entry
   */
  const createFolderUploadEntry = (
    uploadId: string,
    item: UploadPreviewEntry,
  ): FolderUploadProgressEntry => {
    const folder = item.content as FileSystemDirectoryEntry;

    return reactive({
      id: uploadId,
      name: item.name,
      parentId: item.parentId,
      type: 'folder',
      content: folder,
      mimeType: 'inode/directory',
      sizeBytes: 0,
      status: UploadStatus.QUEUED,
      message: 'Queued for upload...',
      uploadedBytes: 0,
      uploadSpeed: 0,
      // Folder-specific properties
      structureInitialized: false,
      foldersInitialized: false,
      nodes: [] as AnyTrackerNode[],
      nodeProgressTypeMap: new Map<
        string,
        RegularUploadProgressEntry | ChunkedUploadProgressEntry
      >(),
    } as FolderUploadProgressEntry);
  };

  /**
   * Create an upload entry from a preview entry
   */
  const createUploadEntry = (item: UploadPreviewEntry): AnyUploadProgressEntry => {
    const uploadId = generateUniqueUploadId();

    if (item.type === 'file' && item.content instanceof File) {
      return createFileUploadEntry(uploadId, item);
    } else if (
      item.type === 'folder' &&
      item.content &&
      typeof (item.content as FileSystemDirectoryEntry).createReader === 'function'
    ) {
      return createFolderUploadEntry(uploadId, item);
    }

    throw new Error('Invalid upload item type');
  };

  /**
   * Create multiple upload entries from preview list
   */
  const createUploadEntries = (items: UploadPreviewEntry[]): AnyUploadProgressEntry[] => {
    const entries: AnyUploadProgressEntry[] = [];

    for (const item of items) {
      try {
        const entry = createUploadEntry(item);
        entries.push(entry);
      } catch (error) {
        console.error(`Failed to create upload entry for ${item.name}:`, error);
        // Continue with other items instead of failing entirely
      }
    }

    return entries;
  };

  /**
   * Create upload entry with validation
   */
  const createValidatedUploadEntry = (
    item: UploadPreviewEntry,
  ): {
    entry?: AnyUploadProgressEntry;
    error?: string;
  } => {
    const validation = validateUploadItem(item);

    if (!validation.valid) {
      return { error: validation.error as string };
    }

    try {
      const entry = createUploadEntry(item);
      return { entry };
    } catch (error: any) {
      return { error: error.message || 'Failed to create upload entry' };
    }
  };

  /**
   * Get upload statistics for a list of items
   */
  const getUploadStats = (
    items: UploadPreviewEntry[],
  ): {
    totalFiles: number;
    totalFolders: number;
    totalSize: number;
    regularUploads: number;
    chunkedUploads: number;
    estimatedTime?: number; // Could add upload time estimation
  } => {
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;
    let regularUploads = 0;
    let chunkedUploads = 0;

    for (const item of items) {
      if (item.type === 'file' && item.content instanceof File) {
        totalFiles++;
        totalSize += item.content.size;

        if (item.content.size >= UPLOAD_CONSTANTS.CHUNKED_UPLOAD_THRESHOLD) {
          chunkedUploads++;
        } else {
          regularUploads++;
        }
      } else if (item.type === 'folder') {
        totalFolders++;
      }
    }

    return {
      totalFiles,
      totalFolders,
      totalSize,
      regularUploads,
      chunkedUploads,
    };
  };

  // Return all the functions and constants
  return {
    // Functions
    validateUploadItem,
    getUploadType,
    createUploadEntry,
    createUploadEntries,
    createValidatedUploadEntry,
    getUploadStats,

    // Constants (if needed in components)
    UPLOAD_CONSTANTS,
  };
}
