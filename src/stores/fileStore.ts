import { defineStore } from 'pinia';
import { useFileOperationsStore } from './fileStores/fileOperationsStore';
import { useFilePreviewStore } from './fileStores/filePreviewStore';
import { useFilterStore } from './fileStores/filterStore';
import { useNavigationStore } from './fileStores/navigationStore';
import { useSelectionStore } from './fileStores/selectionStore';
import { useUploadStore } from './fileStores/uploadStore';

export const useFileStore = defineStore('fileSystem', () => {
  const fileOps = useFileOperationsStore();
  const upload = useUploadStore();
  const selection = useSelectionStore();
  const filter = useFilterStore();
  const navigation = useNavigationStore();
  const preview = useFilePreviewStore();

  // Example of cross-store computed property

  return {
    // Access to all stores
    preview,
    fileOps,
    upload,
    selection,
    filter,
    navigation,
  };
});
