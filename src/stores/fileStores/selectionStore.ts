import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { FileNode } from 'src/types/apiTypes';
import { useFileOperationsStore } from './fileOperationsStore';

export const useSelectionStore = defineStore('selection', () => {
  const fileOps = useFileOperationsStore();

  // Selection state using Set instead of Array
  const selectedItems = ref(new Set<FileNode>());
  const allSelected = ref(false);

  // Computed properties
  const hasSelectedItems = computed(() => selectedItems.value.size > 0);
  const selectedCount = computed(() => selectedItems.value.size);

  // Helper to convert set to array when needed
  const selectedItemsArray = computed(() => Array.from(selectedItems.value));

  function clearSelectedItems() {
    // run this of all children in rawFolderContent, so this function can also be used to initialize the selection state
    fileOps.rawFolderContent.children.forEach(function (item) {
      item.selected = false;
    });

    selectedItems.value.clear();
    allSelected.value = false;
  }

  function removeSelectedItem(item: FileNode) {
    item.selected = false;
    selectedItems.value.delete(item);
  }

  watch(
    () => allSelected.value,
    (newVal) => {
      if (newVal) {
        fileOps.rawFolderContent.children.forEach((item) => {
          selectedItems.value.add(item);
          item.selected = true;
        });
      } else {
        clearSelectedItems();
      }
    },
  );

  return {
    // State
    selectedItems,
    allSelected,

    // Computed
    hasSelectedItems,
    selectedCount,
    selectedItemsArray,

    // Methods
    clearSelectedItems,
    removeSelectedItem,
  };
});
