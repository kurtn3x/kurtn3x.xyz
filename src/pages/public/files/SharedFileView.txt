<template>
  <div
    v-if="initialFetch.loading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div v-if="!initialFetch.loading && initialFetch.error">
    <ErrorPage :error-message="initialFetch.errorMessage" />
  </div>
  <div
    v-if="
      !initialFetch.loading &&
      !initialFetch.passwordValidated &&
      !initialFetch.error
    "
  >
    <ErrorPage
      error-message="Password required"
      v-if="!showPasswordDialog"
    />
    <PasswordDialog
      :prop-item="item"
      :active="showPasswordDialog"
      @close="showPasswordDialog = false"
      @password-received="
        (encryptedPassword) => {
          getFileWithPassword(encryptedPassword);
        }
      "
    />
  </div>
  <div
    v-if="
      !initialFetch.loading &&
      !initialFetch.error &&
      initialFetch.passwordValidated
    "
  >
    <FilePreviewDialog
      :prop-item="item"
      :active="showFilePreviewDialog"
      :password="password"
      @close="showFilePreviewDialog = false"
    />
    <ItemInformationDialog
      :prop-item="item"
      :active="showItemInformationDialog"
      @close="showItemInformationDialog = false"
    />

    <div
      class="text-primary text-h4 text-center q-mt-lg ellipsis text-weight-bolder"
    >
      <q-icon
        :name="getIcon(item.mime)"
        class="q-mr-sm"
      />
      {{ item.name }}
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        :label="'Download (' + item.size + ')'"
        icon="file_download"
        class="cursor-pointer bg-green text-white q-mt-lg"
        push
        @click="downloadFile"
        size="xl"
        style="width: 380px"
      />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        icon="visibility"
        label="Open in File Viewer"
        class="cursor-pointer bg-light-blue-6 text-white q-mt-lg"
        push
        @click="showFilePreviewDialog = true"
        size="xl"
        style="width: 380px"
      />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        label="File Information"
        icon="question_mark"
        class="cursor-pointer q-mt-lg bg-blue-8 text-white"
        push
        @click="showItemInformationDialog = true"
        size="xl"
        style="width: 380px"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { SharedFileType } from 'src/types/index';
import { getIcon } from 'src/components/files/mimeMap';
import { apiGet } from 'src/api/apiWrapper';

import FilePreviewDialog from 'src/components/files/dialogs/FilePreviewDialog.vue';
import ItemInformationDialog from 'src/components/files/dialogs/ItemInformationDialog.vue';
import PasswordDialog from 'src/components/files/dialogs/PasswordDialog.vue';
import ErrorPage from 'src/components/ErrorPage.vue';

export default defineComponent({
  name: 'FileView',
  components: {
    FilePreviewDialog,
    ItemInformationDialog,
    PasswordDialog,
    ErrorPage,
  },
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    return {
      localStore,
      q,
      fileId: ref(''),
      password: ref(''),
      initialFetch: ref({
        loading: true,
        passwordValidated: false,
        error: false,
        errorMessage: '',
      }),
      item: ref({}) as Ref<SharedFileType>,
      showFilePreviewDialog: ref(false),
      showItemInformationDialog: ref(false),
      showPasswordDialog: ref(false),
      getIcon,
    };
  },
  created() {
    this.getFile();
  },
  methods: {
    downloadFile() {
      var args = '';
      if (this.password != '') {
        args += '?password=' + this.password + '&attachment=1';
      } else {
        args += '?attachment=1';
      }
      var url =
        'https://api.kurtn3x.xyz/files/download/file/' + this.item.id + args;
      var link = document.createElement('a');
      link.setAttribute('download', '');
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },

    getFile() {
      if (this.fileId == '') {
        this.fileId = this.$route.params.id as string;
      }

      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      apiGet('/files/file/' + this.fileId, axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.initialFetch.error = false;
          this.initialFetch.passwordValidated = true;
          this.item = apiData.data as SharedFileType;
        } else {
          if (apiData.returnCode == 290) {
            this.showPasswordDialog = true;
            this.initialFetch.passwordValidated = false;
            this.item = {
              id: this.fileId,
              type: 'file',
            } as SharedFileType;
          } else {
            this.q.notify({
              type: 'negative',
              message: apiData.errorMessage,
              progress: true,
            });
            this.initialFetch.error = true;
            this.initialFetch.errorMessage = apiData.errorMessage;
          }
        }
        this.initialFetch.loading = false;
      });
    },

    getFileWithPassword(encryptedPassword: string) {
      if (this.fileId == '') {
        this.fileId = this.$route.params.id as string;
      }

      this.password = encryptedPassword;

      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      var passwordParameter = '?password=' + this.password;

      apiGet(
        '/files/file/' + this.fileId + passwordParameter,
        axiosConfig
      ).then((apiData) => {
        if (apiData.error == false) {
          this.initialFetch.passwordValidated = true;
          this.showPasswordDialog = false;
          this.item = apiData.data as SharedFileType;
        } else {
          this.q.notify({
            type: 'negative',
            message: apiData.errorMessage,
            progress: true,
          });
          this.initialFetch.error = true;
          this.initialFetch.errorMessage = apiData.errorMessage;
        }
      });
    },
  },
});
</script>
