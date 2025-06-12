import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { useFileOperationsStore } from './fileOperationsStore';
import type { FileNode } from 'src/types/apiTypes';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField =
  | 'name'
  | 'nodeType'
  | 'sizeBytes'
  | 'createdIso'
  | 'modifiedIso'
  | 'isShared';

export interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

export const useFilterStore = defineStore('filter', () => {
  const fileOps = useFileOperationsStore();

  // Filter state
  const filterDialog = ref(false);
  const filterSearch = ref('');

  // Modern sorting state
  const sortConfig = reactive<SortConfig>({
    field: null,
    direction: null,
  });

  // Filter configurations
  const sortableFields: Record<SortField, { label: string; getValue: (node: FileNode) => any }> = {
    name: {
      label: 'Name',
      getValue: (node: FileNode) => node.name.toLowerCase(),
    },
    nodeType: {
      label: 'Type',
      getValue: (node: FileNode) => (node.nodeType === 'folder' ? 0 : 1), // Folders first
    },
    sizeBytes: {
      label: 'Size',
      getValue: (node: FileNode) => node.sizeBytes,
    },
    createdIso: {
      label: 'Created',
      getValue: (node: FileNode) => new Date(node.createdIso).getTime(),
    },
    modifiedIso: {
      label: 'Modified',
      getValue: (node: FileNode) => new Date(node.modifiedIso).getTime(),
    },
    isShared: {
      label: 'Shared',
      getValue: (node: FileNode) => (node.isShared ? 1 : 0),
    },
  };

  // Computed properties
  const filteredAndSortedContent = computed(() => {
    let content = fileOps.rawFolderContent.children || [];

    // Apply search filter
    if (filterSearch.value) {
      const search = filterSearch.value.toLowerCase();
      content = content.filter((item: FileNode) => item.name.toLowerCase().includes(search));
    }

    // Apply sorting
    if (sortConfig.field && sortConfig.direction) {
      const sortField = sortableFields[sortConfig.field];
      if (sortField) {
        content = [...content].sort((a: FileNode, b: FileNode) => {
          const aValue = sortField.getValue(a);
          const bValue = sortField.getValue(b);

          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;

          return sortConfig.direction === 'desc' ? -comparison : comparison;
        });
      }
    }

    return content;
  });

  // Methods
  function toggleSort(field: SortField) {
    if (sortConfig.field === field) {
      // Cycle through: asc -> desc -> null
      if (sortConfig.direction === 'asc') {
        sortConfig.direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        clearSort();
      } else {
        sortConfig.direction = 'asc';
      }
    } else {
      // New field, start with ascending
      sortConfig.field = field;
      sortConfig.direction = 'asc';
    }
  }

  function clearSort() {
    sortConfig.field = null;
    sortConfig.direction = null;
  }

  function resetFilterState() {
    clearSort();
    filterSearch.value = '';
  }

  function toggleFilterDialog() {
    filterDialog.value = !filterDialog.value;
    console.log(filterDialog.value);
  }

  // Get sort indicator for UI
  function getSortIndicator(field: SortField): 'asc' | 'desc' | null {
    return sortConfig.field === field ? sortConfig.direction : null;
  }

  // Check if field is currently being sorted
  function isSortedBy(field: SortField): boolean {
    return sortConfig.field === field && sortConfig.direction !== null;
  }

  // Legacy method for backward compatibility (simplified)
  function sortRawFolderContent(type: { label: string; value: number }) {
    const fieldMapping: Record<number, SortField> = {
      1: 'nodeType',
      2: 'name',
      3: 'createdIso',
      4: 'modifiedIso',
      5: 'sizeBytes',
      6: 'isShared',
    };

    const field = fieldMapping[type.value];
    if (field) {
      toggleSort(field);
    }
  }

  return {
    // State
    filterDialog,
    filterSearch,
    sortConfig,
    sortableFields,

    // Computed
    filteredAndSortedContent,

    // Methods
    toggleSort,
    clearSort,
    resetFilterState,
    toggleFilterDialog,
    getSortIndicator,
    isSortedBy,
    sortRawFolderContent, // Legacy
  };
});
