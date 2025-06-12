<template>
  <div
    class="absolute-full flex flex-center bg-transparent"
    v-if="filePreviewStore.loading"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div
    v-if="!filePreviewStore.loading && filePreviewStore.error"
    class="row justify-center q-mt-lg text-red text-h6"
  >
    {{ filePreviewStore.errorMessage }}
  </div>

  <div
    v-if="!filePreviewStore.loading && !filePreviewStore.error"
    class="col column"
  >
    <div
      class="bg-layout-bg text-layout-text row rounded-borders q-pa-none"
      style="height: 45px"
    >
      <div class="col row justify-start">
        <q-btn
          icon="save"
          label="Save"
          flat
          stretch
          class="bg-green text-white"
          @click="
            filePreviewStore.updateFileContent(
              filePreviewStore.activeFile.id,
              filePreviewStore.activeFileContent,
            )
          "
          v-if="localStore.isAuthenticated"
        />
        <q-separator
          vertical
          color="layout-text"
          v-if="localStore.isAuthenticated"
        />
      </div>

      <div class="col row justify-end">
        <q-separator
          vertical
          color="white"
        />
        <q-btn
          :icon="localStore.isDarkMode ? 'dark_mode' : 'light_mode'"
          flat
          @click="localStore.toggleDarkMode()"
        />
      </div>
    </div>

    <q-editor
      v-model="filePreviewStore.activeFileContent"
      :toolbar="[
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'hr', 'link', 'custom_btn'],
        [
          {
            label: $q.lang.editor.formatting,
            icon: $q.iconSet.editor.formatting,
            list: 'no-icons',
            options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
          },
          {
            label: $q.lang.editor.fontSize,
            icon: $q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'],
          },
          {
            label: $q.lang.editor.defaultFont,
            icon: $q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana',
            ],
          },
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: false,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify'],
          },
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

        ['undo', 'redo'],
        ['viewsource', 'print'],
      ]"
      :fonts="{
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana',
      }"
      :dark="localStore.isDarkMode"
      :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
      class="col column"
      max-height="600px"
      @keydown.ctrl.s.prevent.stop="
        filePreviewStore.updateFileContent(
          filePreviewStore.activeFile.id,
          filePreviewStore.activeFileContent,
        )
      "
    />
  </div>
</template>

<script setup lang="ts">
import { useFilePreviewStore } from 'src/stores/fileStores/filePreviewStore';
import { useLocalStore } from 'src/stores/localStore';

const filePreviewStore = useFilePreviewStore();
const localStore = useLocalStore();
</script>
