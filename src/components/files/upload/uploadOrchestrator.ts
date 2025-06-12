import { type Ref } from 'vue';
import { useQuasar } from 'quasar';
import type { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import { useUploadEntryBuilder } from './helpers/uploadEntryBuilder';
import { useUploadValidator } from './helpers/uploadValidator';
import { useUploadProcessor } from './uploadProcessor';
import type { AnyUploadProgressEntry, UploadPreviewEntry } from 'src/types/localTypes';

export function useUploadOrchestrator(
  fileOps: ReturnType<typeof useFileOperationsStore>,
  uploadLists: {
    preview: Ref<UploadPreviewEntry[]>;
    progress: Ref<AnyUploadProgressEntry[]>;
    queue: Ref<AnyUploadProgressEntry[]>;
  },
) {
  const q = useQuasar();

  // Use the composables
  const entryBuilder = useUploadEntryBuilder();
  const validator = useUploadValidator(fileOps, uploadLists);
  const processor = useUploadProcessor();

  /**
   * Add upload entry with validation
   */
  const addUploadEntry = (
    entry: File | FileSystemEntry,
    type: 'file' | 'folder',
    parentId: string,
  ): void => {
    const name = entry.name;

    const previewEntry: UploadPreviewEntry = {
      name: validator.findAvailableName(name, type),
      type,
      parentId,
      content: entry,
      edit: false,
      edit_name: '',
    };

    const validation = entryBuilder.validateUploadItem(previewEntry);

    if (!validation.valid) {
      q.notify({
        type: 'negative',
        message: validation.error as string,
      });
      return;
    }

    uploadLists.preview.value.push(previewEntry);

    if (type === 'file' && entry instanceof File) {
      const uploadType = entryBuilder.getUploadType(previewEntry);
      console.log(`Added ${uploadType} upload: ${previewEntry.name}`);
    }
  };

  /**
   * Create upload entries from preview list
   */
  const createUploadProgressEntries = (): AnyUploadProgressEntry[] => {
    const validItems: UploadPreviewEntry[] = [];
    const errors: string[] = [];

    for (const item of uploadLists.preview.value) {
      const validation = entryBuilder.validateUploadItem(item);

      if (validation.valid) {
        validItems.push(item);
      } else {
        errors.push(`${item.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      q.notify({
        type: 'negative',
        message: `Upload validation failed:\n${errors.join('\n')}`,
        timeout: 5000,
      });
    }

    return entryBuilder.createUploadEntries(validItems);
  };

  /**
   * Handle file name changes
   */
  const changeFileName = (file: UploadPreviewEntry): boolean => {
    return validator.changeFileName(file);
  };

  /**
   * Get upload processor (for backward compatibility)
   */
  const getProcessor = () => {
    return processor;
  };

  /**
   * Get preview statistics
   */
  const getPreviewStats = () => {
    return entryBuilder.getUploadStats(uploadLists.preview.value);
  };

  /**
   * Validate multiple items and return summary
   */
  const validatePreviewItems = (): {
    valid: UploadPreviewEntry[];
    invalid: Array<{ item: UploadPreviewEntry; error: string }>;
  } => {
    const valid: UploadPreviewEntry[] = [];
    const invalid: Array<{ item: UploadPreviewEntry; error: string }> = [];

    for (const item of uploadLists.preview.value) {
      const validation = entryBuilder.validateUploadItem(item);

      if (validation.valid) {
        valid.push(item);
      } else {
        invalid.push({ item, error: validation.error! });
      }
    }

    return { valid, invalid };
  };

  /**
   * Bulk add multiple files/folders
   */
  const addMultipleEntries = (
    entries: Array<{ entry: File | FileSystemEntry; type: 'file' | 'folder' }>,
    parentId: string,
  ): {
    added: number;
    skipped: number;
    errors: string[];
  } => {
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const { entry, type } of entries) {
      try {
        const initialCount = uploadLists.preview.value.length;
        addUploadEntry(entry, type, parentId);

        if (uploadLists.preview.value.length > initialCount) {
          added++;
        } else {
          skipped++;
        }
      } catch (error: any) {
        errors.push(`${entry.name}: ${error.message}`);
        skipped++;
      }
    }

    return { added, skipped, errors };
  };

  /**
   * Clear all preview items
   */
  const clearPreview = (): void => {
    uploadLists.preview.value = [];
  };

  /**
   * Remove specific preview item
   */
  const removePreviewItem = (name: string): boolean => {
    const index = uploadLists.preview.value.findIndex((item) => item.name === name);
    if (index !== -1) {
      uploadLists.preview.value.splice(index, 1);
      return true;
    }
    return false;
  };

  /**
   * Check if preview list has conflicts
   */
  const hasPreviewConflicts = (): boolean => {
    const names = new Set<string>();

    for (const item of uploadLists.preview.value) {
      if (names.has(item.name)) {
        return true;
      }
      names.add(item.name);
    }

    return false;
  };

  return {
    // Core functions
    addUploadEntry,
    createUploadProgressEntries,
    changeFileName,
    getPreviewStats,

    // Enhanced functions
    validatePreviewItems,
    addMultipleEntries,
    clearPreview,
    removePreviewItem,
    hasPreviewConflicts,

    // Backward compatibility
    getProcessor,

    // Access to underlying composables (if needed)
    entryBuilder,
    validator,
    processor,
  };
}
