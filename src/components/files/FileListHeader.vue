<template>
  <!-- Header Row -->
  <div class="file-list-header full-height full-width flex-center">
    <!-- Checkbox column -->
    <div class="file-checkbox flex-center">
      <!-- Empty header for checkbox column -->
    </div>

    <!-- Icon column -->
    <div class="file-icon">
      <!-- Empty header for icon column -->
    </div>

    <!-- Filename column -->
    <div class="file-name text-weight-bold">
      <q-item
        dense
        class="q-pa-none row items-center"
        @click="filterStore.toggleSort('name')"
        clickable
        style="width: 80px"
      >
        <div class="q-ml-sm">Name</div>
        <q-icon
          v-if="filterStore.getSortIndicator('name')"
          :name="
            filterStore.getSortIndicator('name') === 'asc'
              ? 'keyboard_arrow_up'
              : 'keyboard_arrow_down'
          "
          size="16px"
          class="q-ml-sm"
        />
      </q-item>
    </div>

    <!-- Size column -->
    <div class="file-size text-weight-bold row justify-end">
      <q-item
        dense
        class="q-pa-none row items-center justify-end"
        @click="filterStore.toggleSort('sizeBytes')"
        clickable
        style="width: 70px"
      >
        <div
          style="width: 20px"
          class="q-mr-sm"
        >
          <q-icon
            v-if="filterStore.getSortIndicator('sizeBytes')"
            :name="
              filterStore.getSortIndicator('sizeBytes') === 'asc'
                ? 'keyboard_arrow_up'
                : 'keyboard_arrow_down'
            "
            size="16px"
          />
        </div>
        <div class="q-mr-sm">Size</div>
      </q-item>
    </div>

    <!-- Modified date column -->
    <div class="file-date text-weight-bold row justify-end">
      <q-item
        dense
        class="q-pa-none row items-center justify-end"
        @click="filterStore.toggleSort('modifiedIso')"
        clickable
        style="width: 100px"
      >
        <div
          style="width: 20px"
          class="q-mr-sm"
        >
          <q-icon
            v-if="filterStore.getSortIndicator('modifiedIso')"
            :name="
              filterStore.getSortIndicator('modifiedIso') === 'asc'
                ? 'keyboard_arrow_up'
                : 'keyboard_arrow_down'
            "
            size="16px"
          />
        </div>
        <div class="q-mr-sm">Modified</div>
      </q-item>
    </div>

    <!-- Actions column -->
    <div class="file-actions">
      <!-- Empty header for actions column -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilterStore } from 'src/stores/fileStores/filterStore';

const filterStore = useFilterStore();
</script>
<style scoped>
.file-checkbox {
  width: 40px;
  min-width: 40px;
}

.file-icon {
  width: 35px;
  min-width: 35px;
}

.file-name {
  min-width: 100px;
}

.file-size {
  width: 115px;
  min-width: 115px;
  text-align: left !important;

  white-space: nowrap;
  overflow: hidden;
}

.file-date {
  width: 200px;
  min-width: 200px;
  text-align: right !important;
  white-space: nowrap;
  overflow: hidden;
}

.file-actions {
  width: 50px;
  min-width: 50px;
  padding-left: 20px;
}

/* Individual header cells */
.file-list-header {
  display: grid;
  grid-template-columns: 40px 35px minmax(100px, 1fr) 115px 200px 50px;
  padding-left: 20px;
  padding-right: 20px;
}

.file-list-header > div:nth-child(1) {
  grid-column: 1;
  justify-self: center;
}

.file-list-header > div:nth-child(2) {
  grid-column: 2;
  justify-self: center;
}

.file-list-header > div:nth-child(3) {
  grid-column: 3;
}

.file-list-header > div:nth-child(4) {
  grid-column: 4;
  text-align: right !important;
}

.file-list-header > div:nth-child(5) {
  grid-column: 5;
  text-align: right !important;
}

.file-list-header > div:nth-child(6) {
  grid-column: 6;
  justify-self: center;
}

@media (max-width: 599px) {
  .file-list-header {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 50px;
  }

  .file-name,
  .file-size,
  .file-date {
    display: none;
  }

  .file-list-header > div:nth-child(6) {
    grid-column: 4;
  }
}
</style>
