import { defineStore } from 'pinia';
import { useFileOperationsStore } from './fileStores/fileOperationsStore';
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

  // Example of cross-store computed property

  return {
    // Access to all stores
    fileOps,
    upload,
    selection,
    filter,
    navigation,
  };
});
