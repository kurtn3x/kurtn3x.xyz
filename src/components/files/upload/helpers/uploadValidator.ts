import { type Ref } from 'vue';
import { useQuasar } from 'quasar';
import type { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import type { AnyUploadProgressEntry, UploadPreviewEntry } from 'src/types/localTypes';

export function useUploadValidator(
  fileOps: ReturnType<typeof useFileOperationsStore>,
  uploadLists: {
    preview: Ref<UploadPreviewEntry[]>;
    progress: Ref<AnyUploadProgressEntry[]>;
    queue: Ref<AnyUploadProgressEntry[]>;
  },
) {
  const q = useQuasar();

  /**
   * Check if name is available across all upload states
   */
  const nameAvailable = (name: string): boolean => {
    // Check preview list
    if (uploadLists.preview.value.some((el) => el.name === name)) {
      return false;
    }

    // Check active progress list
    if (uploadLists.progress.value.some((el) => el.name === name)) {
      return false;
    }

    // Check queue
    if (uploadLists.queue.value.some((el) => el.name === name)) {
      return false;
    }

    // Check existing files in current folder
    if (fileOps.rawFolderContent.children.some((el) => el.name === name)) {
      return false;
    }

    return true;
  };

  /**
   * Validate upload name
   */
  const validName = (name: string): boolean => {
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
  };

  /**
   * Find available file name with automatic numbering
   */
  const findAvailableFileName = (originalName: string): string => {
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
  };

  /**
   * Find available folder name with automatic numbering
   */
  const findAvailableFolderName = (originalName: string): string => {
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
  };

  /**
   * Find available name with automatic numbering
   */
  const findAvailableName = (originalName: string, type: 'file' | 'folder'): string => {
    if (nameAvailable(originalName)) {
      return originalName;
    }

    if (type === 'file') {
      return findAvailableFileName(originalName);
    } else {
      return findAvailableFolderName(originalName);
    }
  };

  /**
   * Handle file name changes for preview entries
   */
  const changeFileName = (file: UploadPreviewEntry): boolean => {
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
  };

  /**
   * Validate file name without showing notifications (for programmatic use)
   */
  const isValidFileName = (name: string): { valid: boolean; error?: string } => {
    if (name.length < 1) {
      return { valid: false, error: 'Name must be at least 1 character long.' };
    }

    if (name.includes('/') || name.includes('\x00')) {
      return { valid: false, error: 'Name contains invalid characters.' };
    }

    if (!nameAvailable(name)) {
      return { valid: false, error: 'Item with same name already exists in upload list' };
    }

    return { valid: true };
  };

  /**
   * Check if a specific name conflicts with existing items
   */
  const hasNameConflict = (
    name: string,
  ): {
    hasConflict: boolean;
    conflictLocation?: 'preview' | 'progress' | 'queue' | 'folder';
  } => {
    if (uploadLists.preview.value.some((el) => el.name === name)) {
      return { hasConflict: true, conflictLocation: 'preview' };
    }

    if (uploadLists.progress.value.some((el) => el.name === name)) {
      return { hasConflict: true, conflictLocation: 'progress' };
    }

    if (uploadLists.queue.value.some((el) => el.name === name)) {
      return { hasConflict: true, conflictLocation: 'queue' };
    }

    if (fileOps.rawFolderContent.children.some((el) => el.name === name)) {
      return { hasConflict: true, conflictLocation: 'folder' };
    }

    return { hasConflict: false };
  };

  return {
    // Core validation functions
    validName,
    nameAvailable,
    isValidFileName,

    // Name generation functions
    findAvailableName,
    findAvailableFileName,
    findAvailableFolderName,

    // UI helper functions
    changeFileName,

    // Utility functions
    hasNameConflict,
  };
}
