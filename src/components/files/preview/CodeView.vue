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
          @click="updateContent"
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
          color="layout-text"
          v-if="filePreviewStore.activeFile.mimeType == 'text/code-markdown'"
        />
        <q-btn
          :icon="markdownPreview ? 'visibility_off' : 'visibility'"
          flat
          @click="markdownPreview = !markdownPreview"
          v-if="filePreviewStore.activeFile.mimeType == 'text/code-markdown'"
        >
          <q-tooltip class="bg-layout-bg text-layout-text text-body2">Markdown Preview</q-tooltip>
        </q-btn>
        <q-separator
          vertical
          color="layout-text"
        />
        <q-btn
          icon="settings"
          flat
          stretch
        >
          <q-menu
            class="no-shadow"
            anchor="bottom middle"
            self="top middle"
          >
            <q-card bordered>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-center text-body1 text-light-blue-6">
                    Syntax
                  </q-item-label>
                  <q-option-group
                    :model-value="currentSyntax"
                    :options="langOptions"
                    color="light-blue-6"
                    class="q-mr-md q-mt-xs q-mb-xs"
                    @update:model-value="(value) => updateSyntax(value)"
                  />
                </q-item-section>
              </q-item>
              <q-separator color="blue-5" />
              <q-item>
                <q-item-section>
                  <q-item-label class="text-center text-body1 text-light-blue-6">
                    Tab Spaces
                  </q-item-label>
                  <div class="row q-mt-sm">
                    <q-btn
                      :disable="tabsize == 2"
                      label="2"
                      flat
                      class="col bg-blue-6 text-white q-mr-xs"
                      @click="tabsize = 2"
                    />
                    <q-btn
                      :disable="tabsize == 4"
                      label="4"
                      flat
                      class="col bg-blue-6 text-white q-ml-xs"
                      @click="tabsize = 4"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-card>
          </q-menu>
        </q-btn>
        <q-separator
          vertical
          color="layout-text"
        />
        <q-btn
          :icon="localStore.isDarkMode ? 'dark_mode' : 'light_mode'"
          flat
          @click="localStore.toggleDarkMode()"
        />
      </div>
    </div>
    <q-card
      bordered
      class="col column"
    >
      <q-scroll-area
        :class="localStore.isDarkMode ? 'bg-one-dark text-white' : 'bg-white text-dark'"
        class="col column"
        v-if="markdownPreview"
      >
        <vue-markdown
          :source="filePreviewStore.activeFileContent"
          class="col column q-ml-md q-mb-md q-mt-md markdown-content"
          :options="options"
          :plugins="plugins"
        />
      </q-scroll-area>
      <q-scroll-area
        :class="localStore.isDarkMode ? 'bg-one-dark text-white' : 'bg-white text-dark'"
        class="col column"
        v-else
      >
        <codemirror
          v-model="filePreviewStore.activeFileContent"
          class="col column"
          placeholder="Write something..."
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="tabsize"
          :extensions="extensions"
          @ready="handleReady"
          @keydown.ctrl.s.prevent.stop="updateContent"
        />
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import 'highlight.js/styles/github-dark.css';
import MarkdownItHighlightjs from 'markdown-it-highlightjs';
import { Codemirror } from 'vue-codemirror';
import VueMarkdown from 'vue-markdown-render';
import { computed, onMounted, ref, shallowRef } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useFilePreviewStore } from 'src/stores/fileStores/filePreviewStore';

const plugins = [MarkdownItHighlightjs];

const options = {
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
};

const localStore = useLocalStore();
const filePreviewStore = useFilePreviewStore();

// options / values
const tabsize = ref(4);

// markdown preview
const markdownPreview = ref(false);

// lang options
const langmap = new Map();
langmap.set('text/code-python', python());
langmap.set('text/code-json', json());
langmap.set('text/code-markdown', markdown());
langmap.set('text/code-javascript', javascript());

const langOptions = [
  {
    label: 'None',
    value: 'text/code',
  },
  {
    label: 'Python',
    value: 'text/code-python',
  },
  {
    label: 'JSON',
    value: 'text/code-json',
  },
  {
    label: 'MarkDown',
    value: 'text/code-markdown',
  },
  {
    label: 'JavaScript',
    value: 'text/code-javascript',
  },
];

const currentSyntax = computed(() => {
  const mimeType = filePreviewStore.activeFile.mimeType;

  // Check if the current mimeType is in our supported options
  const isSupported = langOptions.some((option) => option.value === mimeType);

  // If supported, return it; otherwise return the default "None" value
  return isSupported ? mimeType : 'text/code';
});

// codemirror options
const extensions = computed(() => {
  const baseExtensions = localStore.isDarkMode ? [basicSetup, oneDark] : [basicSetup];

  // Check if the active file's mimeType has a corresponding language extension
  const langExtension = langmap.get(filePreviewStore.activeFile.mimeType);

  if (langExtension) {
    return [...baseExtensions, langExtension];
  } else {
    return baseExtensions;
  }
});

const view = shallowRef();
const handleReady = (payload: { view: any }) => {
  view.value = payload.view;
};

async function updateContent() {
  await filePreviewStore.updateFileContent(
    filePreviewStore.activeFile.id,
    filePreviewStore.activeFileContent,
  );
}

async function updateSyntax(value: string) {
  await filePreviewStore.updateFileMimeType(filePreviewStore.activeFile.id, value);
}

onMounted(async () => {
  await filePreviewStore.getFileContent(filePreviewStore.activeFile.id);
});
</script>

<style>
.bg-one-dark {
  background-color: #282c34;
}
.markdown-content {
  font-size: 1.2rem;
  line-height: 1.2;
}

/* Headings */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 0.9rem; /* reduced from 1.2rem */
  margin-bottom: 0.6rem; /* reduced from 0.8rem */
  line-height: 1.1; /* reduced from 1.2 */
}

.markdown-content h1 {
  font-size: 3rem;
}
.markdown-content h2 {
  font-size: 2.7rem;
}
.markdown-content h3 {
  font-size: 2.4rem;
}
.markdown-content h4 {
  font-size: 2.1rem;
}
.markdown-content h5 {
  font-size: 1.8rem;
}
.markdown-content h6 {
  font-size: 1.5rem;
}

.markdown-content p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.markdown-content ul,
.markdown-content ol {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 2.4rem;
}

.markdown-content li {
  margin: 0.25rem 0;
  line-height: 1.2;
}

/* Code blocks */
.markdown-content pre {
  margin: 0.7rem 0;
  padding: 0.8rem;
  font-size: 1rem;
  line-height: 1.1;
}

.markdown-content blockquote {
  margin: 0.7rem 0;
  padding-left: 1.6rem;
  font-size: 1rem;
  line-height: 1.2;
  border-left: 4px solid #4fc3f7;
}
</style>
