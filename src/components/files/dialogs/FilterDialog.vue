<!-- filepath: /home/kurtn3x/main/kurtn3x.xyz/src/components/files/dialogs/FilterDialog.vue -->
<template>
  <q-card style="width: 320px; max-width: 320px !important">
    <q-card-section class="q-pa-none row">
      <div class="q-pa-sm">
        <q-icon
          name="tune"
          size="sm"
          class="q-ml-sm"
        />
        <a class="q-ml-md ellipsis text-h6">Filters</a>
      </div>
      <q-space />

      <q-btn
        size="sm"
        flat
        stretch
        icon="close"
        @click="filterStore.toggleFilterDialog()"
        class="close"
      />
    </q-card-section>

    <q-separator :color="localStore.isDarkMode ? 'white' : 'dark'" />

    <q-card-section class="q-py-sm q-px-md">
      <!-- Compact Search -->
      <q-input
        v-model="filterStore.filterSearch"
        outlined
        placeholder="Search..."
        clearable
        dense
        class="q-mb-sm"
      >
        <template v-slot:prepend>
          <q-icon
            name="search"
            size="18px"
          />
        </template>
      </q-input>

      <!-- Compact Sort Row -->
      <div class="row items-center q-gutter-xs q-mb-sm">
        <div
          class="text-caption text-weight-medium text-grey-7"
          style="min-width: 35px"
        >
          Sort:
        </div>
        <q-select
          v-model="currentSortField"
          :options="sortFieldOptions"
          outlined
          dense
          options-dense
          emit-value
          map-options
          placeholder="None"
          style="min-width: 100px"
          class="col"
          @update:model-value="handleSortFieldChange"
        />
        <q-btn
          v-if="filterStore.sortConfig.field"
          flat
          dense
          size="sm"
          :icon="getSortDirectionIcon()"
          :color="filterStore.sortConfig.direction ? 'primary' : 'grey-6'"
          @click="toggleSortDirection"
          class="q-ml-xs"
        />
      </div>

      <!-- Active Filters (Compact Chips) -->
      <!--
      <div
        v-if="hasActiveFilters"
        class="row q-gutter-xs q-mb-sm"
      >
        <q-chip
          v-if="filterStore.filterSearch"
          removable
          @remove="clearSearch"
          dense
          size="sm"
          color="blue"
          text-color="white"
          icon="search"
        >
          "{{ truncateText(filterStore.filterSearch, 12) }}"
        </q-chip>

        <q-chip
          v-if="filterStore.sortConfig.field"
          removable
          @remove="clearSort"
          dense
          size="sm"
          color="purple"
          text-color="white"
          :icon="getSortDirectionIcon()"
        >
          {{ getCompactSortLabel() }}
        </q-chip>
      </div>
      -->

      <!-- Quick Actions (Compact) -->
      <!--
      <div class="row q-gutter-xs">
        <q-btn
          size="xs"
          outline
          dense
          color="primary"
          icon="folder"
          @click="quickSort('nodeType')"
          :disable="filterStore.isSortedBy('nodeType')"
        >
          <q-tooltip>Folders First</q-tooltip>
        </q-btn>
        <q-btn
          size="xs"
          outline
          dense
          color="secondary"
          icon="sort_by_alpha"
          @click="quickSortNameAsc"
          :disable="isNameAscending"
        >
          <q-tooltip>Name A-Z</q-tooltip>
        </q-btn>
        <q-btn
          size="xs"
          outline
          dense
          color="accent"
          icon="schedule"
          @click="quickSortNewest"
          :disable="isNewestFirst"
        >
          <q-tooltip>Newest First</q-tooltip>
        </q-btn>
        <q-space />
        <q-btn
          v-if="hasActiveFilters"
          size="xs"
          flat
          dense
          color="grey-7"
          icon="refresh"
          @click="resetAll"
        >
          <q-tooltip>Reset All</q-tooltip>
        </q-btn>
      </div>
      -->

      <!-- Results Count (Very Compact) -->
      <div class="text-caption text-grey-6 q-mt-xs text-center">
        {{ filterStore.filteredAndSortedContent.length }} / {{ totalFiles }} items
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import type { SortField } from 'src/stores/fileStores/filterStore';
import { useFilterStore } from 'src/stores/fileStores/filterStore';
import { useLocalStore } from 'src/stores/localStore';

// Stores
const filterStore = useFilterStore();
const fileOps = useFileOperationsStore();
const localStore = useLocalStore();

// Local reactive state
const currentSortField = ref<SortField | null>(filterStore.sortConfig.field);

// Compact sort field options
const sortFieldOptions = [
  { label: 'Name', value: 'name' as SortField },
  { label: 'Size', value: 'sizeBytes' as SortField },
  { label: 'Type', value: 'nodeType' as SortField },
  { label: 'Modified', value: 'modifiedIso' as SortField },
  { label: 'Created', value: 'createdIso' as SortField },
  { label: 'Shared', value: 'isShared' as SortField },
];

const totalFiles = computed(() => fileOps.rawFolderContent.children?.length || 0);

// Watch for external changes
watch(
  () => filterStore.sortConfig.field,
  (newField) => {
    currentSortField.value = newField;
  },
);

// Methods
function handleSortFieldChange(field: SortField | null) {
  if (field) {
    if (filterStore.sortConfig.field === field) {
      // If same field, toggle direction
      filterStore.toggleSort(field);
    } else {
      // New field, start with ascending
      filterStore.sortConfig.field = field;
      filterStore.sortConfig.direction = 'asc';
    }
  } else {
    filterStore.clearSort();
  }
}

function toggleSortDirection() {
  if (filterStore.sortConfig.field) {
    const newDirection = filterStore.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    filterStore.sortConfig.direction = newDirection;
  }
}

function getSortDirectionIcon(): string {
  if (!filterStore.sortConfig.direction) return 'sort';
  return filterStore.sortConfig.direction === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
}
</script>

<style scoped>
/* Remove any extra spacing */
.q-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Compact button styling */
.q-btn.dense {
  min-height: 24px;
}

/* Tighter spacing for chips */
.q-chip--dense {
  height: 20px;
  font-size: 11px;
}

/* Compact select styling */
.q-select .q-field__control {
  min-height: 32px;
}

.close:hover {
  background-color: rgba(255, 0, 0, 0.644);
}
</style>
