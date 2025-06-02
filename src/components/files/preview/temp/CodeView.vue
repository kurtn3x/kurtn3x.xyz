<template>
  <div
    class="absolute-full flex flex-center bg-transparent"
    v-if="loading"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div
    v-if="!loading && error"
    class="row justify-center q-mt-lg text-red text-h6"
  >
    Couldn't load Text from File.
  </div>

  <div
    v-if="!loading && !error"
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
          v-if="lang == 'markdown'"
        />
        <q-btn
          :icon="markdownPreview ? 'visibility_off' : 'visibility'"
          flat
          @click="markdownPreview = !markdownPreview"
          v-if="lang == 'markdown'"
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
                    v-model="lang"
                    :options="langOptions"
                    color="light-blue-6"
                    class="q-mr-md q-mt-xs q-mb-xs"
                    @update:model-value="updateSyntax"
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
          :icon="isDarkMode ? 'dark_mode' : 'light_mode'"
          flat
          @click="isDarkMode = !isDarkMode"
        />
      </div>
    </div>
    <q-card
      bordered
      class="col column"
    >
      <q-resize-observer
        @resize="onResize"
        :debounce="250"
      />
      <q-scroll-area
        :class="isDarkMode ? 'bg-one-dark text-white' : 'bg-white text-dark'"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="col column"
        v-if="markdownPreview"
      >
        <vue-markdown
          :source="text"
          class="col column q-ml-md q-mb-md q-mt-md markdown-content"
          :options="options"
          :plugins="plugins"
        />
      </q-scroll-area>
      <q-scroll-area
        :class="isDarkMode ? 'bg-one-dark text-white' : 'bg-white text-dark'"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="col column"
        v-else
      >
        <codemirror
          v-model="text"
          class="col column"
          placeholder="Write something..."
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="tabsize"
          :extensions="extensions"
          @update="handleStateUpdate"
          @ready="handleReady"
          @keydown.ctrl.s.prevent.stop="updateContent"
        />
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script setup>
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
import { computed, defineProps, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet, apiPut } from 'src/api/apiWrapper';
import { useLocalStore } from 'stores/localStore';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

const plugins = [MarkdownItHighlightjs];

const options = {
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
};

const item = computed(() => props.item);

const q = useQuasar();
const localStore = useLocalStore();
const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};
var loading = ref(true);
var error = ref(false);

// lang options
const langmap = new Map();
langmap.set('python', python());
langmap.set('json', json());
langmap.set('markdown', markdown());
langmap.set('javascript', javascript());
const langOptions = [
  {
    label: 'None',
    value: '',
  },
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Json',
    value: 'json',
  },
  {
    label: 'Markdown',
    value: 'markdown',
  },
  {
    label: 'Javascript',
    value: 'javascript',
  },
];
// options / values
var lang = ref('');
var tabsize = ref(4);
var text = ref('');

// markdown preview
var markdownPreview = ref(false);

watch(
  () => props.item,
  (newVal) => {
    getFileContent();
  },
  { immediate: true },
);

onMounted(async () => {
  var els = document.getElementsByClassName('q-scrollarea__container');
  for (var el of els) {
    el.classList.add('column', 'col');
  }
});

// styling
var thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  backgroundColor: '#0288d1',
  width: '5px',
  opacity: 0.75,
};
var barStyle = {
  right: '2px',
  borderRadius: '9px',
  backgroundColor: '#4fc3f7',
  width: '9px',
  opacity: 0.2,
};
var isDarkMode = ref(localStore.isDarkMode);

// codemirror options
const extensions = computed(() => {
  if (isDarkMode.value && lang.value == '') {
    return [basicSetup, oneDark];
  } else if (!isDarkMode.value && lang.value == '') {
    return [basicSetup];
  } else if (isDarkMode.value && lang.value != '') {
    return [basicSetup, oneDark, langmap.get(lang.value)];
  } else {
    return [basicSetup, langmap.get(lang.value)];
  }
});
const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
};

const state = reactive({
  lines: null,
  cursor: null,
  selected: null,
  length: null,
});

const handleStateUpdate = (viewUpdate) => {
  const ranges = viewUpdate.state.selection.ranges;
  state.selected = ranges.reduce((plus, range) => plus + range.to - range.from, 0);
  state.cursor = ranges[0].anchor;
  state.length = viewUpdate.state.doc.length;
  state.lines = viewUpdate.state.doc.lines;
};

// functions
function getFileContent() {
  const initialMime = item.value.mime;
  if (['text/x-python', 'text/code-python'].indexOf(initialMime) > -1) {
    lang.value = 'python';
  } else if (
    ['application/x-javascript', 'application/javascript', 'text/code-javascript'].indexOf(
      initialMime,
    ) > -1
  ) {
    lang.value = 'javascript';
  } else if (['text/markdown', 'text/code-markdown'].indexOf(initialMime) > -1) {
    lang.value = 'markdown';
  } else if (['application/json', 'text/code-json'].indexOf(initialMime) > -1) {
    lang.value = 'json';
  } else {
    lang.value = '';
  }

  if (!localStore.isAuthenticated && lang.value == 'markdown') {
    markdownPreview.value = true;
  } else {
    markdownPreview.value = false;
  }

  var args = '';
  if (props.password != '') {
    args += '?password=' + props.password;
  }
  apiGet('/files/file-content/' + item.value.id + args, axiosConfig).then((apiData) => {
    if (apiData.error == false) {
      text.value = apiData.data.content;
      loading.value = false;
      error.value = false;
    } else {
      loading.value = false;
      error.value = true;
    }
  });
}

function updateContent() {
  if (!localStore.isAuthenticated) {
    return;
  }
  var data = {
    content: text.value,
  };
  apiPut('/files/file-content/' + item.value.id, data, axiosConfig).then((apiData) => {
    if (apiData.error == false) {
      q.notify({
        type: 'positive',
        message: 'Saved.',
      });
      apiGet('/files/file-content/' + item.value.id + '?only_size=1', axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            item.value.size = apiData.data.size;
            item.value.sizeBytes = apiData.data.sizeBytes;
          } else {
            q.notify({
              type: 'negative',
              message: apiData.errorMessage,
            });
          }
        },
      );
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage,
      });
    }
  });
}

function updateSyntax(syntax) {
  var data = {
    itemId: item.value.id,
    mime: 'text/code' + (syntax != '' ? '-' + syntax : ''),
  };
  apiPut('/files/file/' + item.value.id, data, axiosConfig).then((apiData) => {
    if (apiData.error == false) {
      q.notify({
        type: 'positive',
        message: 'Saved.',
      });
      item.value.mime = data.mime;
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage,
      });
    }
  });
}

function onResize() {
  var els = document.getElementsByClassName('q-scrollarea__container');
  for (var el of els) {
    el.classList.add('column', 'col');
  }
}
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
