<template>
  <q-dialog
    v-model="showDialog"
    @hide="close"
    persistent
    backdrop-filter="brightness(0%)"
  >
    <q-card
      bordered
      style="width: 350px"
    >
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Password Required</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ml-md q-mr-md q-mt-lg q-mb-sm">
        <q-input
          :color="isDarkMode ? 'white' : 'black'"
          v-model="password"
          outlined
          label="Password"
          class="text-primary text-body1 col"
          @keyup.enter="submitPassword"
          :type="isPwd ? 'password' : 'text'"
          input-style="font-size: 18px"
          input-class="text-body1 text-layout-text"
          :loading="loading"
          :error="error"
          :error-message="errorMessage"
        >
          <template v-slot:append>
            <q-icon
              color="layout-text"
              class="pw_icon"
              :name="isPwd ? 'visibility' : 'visibility_off'"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
      <q-separator />
      <q-card-actions
        align="center"
        class="row q-mt-sm q-mb-sm"
      >
        <q-btn
          v-close-popup
          push
          icon="close"
          label="Cancel"
          class="bg-red text-white col"
        />
        <q-btn
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="Submit"
          :loading="loading"
          @click="submitPassword"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import type { Ref } from 'vue';
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { apiPost } from 'src/api/apiWrapper';
import { useLocalStore } from 'stores/localStore';
import type { FileNode } from 'src/types/apiTypes';

export default defineComponent({
  name: 'PasswordDialog',
  props: {
    propItem: Object,
    active: Boolean,
  },
  emits: ['close', 'passwordReceived'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    const showDialog = ref(props.active);
    const item = ref(props.propItem) as Ref<FileNode>;

    return {
      localStore,
      q,
      showDialog,
      password: ref(''),
      isPwd: ref(true),
      loading: ref(false),
      error: ref(false),
      errorMessage: ref(''),
      item,
    };
  },
  computed: {
    isDarkMode() {
      return this.localStore.isDarkMode;
    },
  },
  watch: {
    active(newVal, oldVal) {
      this.showDialog = newVal;
    },
    propItem(newVal, oldVal) {
      this.item = newVal;
    },
  },
  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },
    submitPassword() {
      this.loading = true;
      const data = {
        id: this.item.id,
        type: this.item.nodeType,
        password: this.password,
      };
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      apiPost('/files/password', data, axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          const pw = encodeURIComponent(apiData.data.encryptedPassword);
          this.$emit('passwordReceived', pw);
        } else {
          if (apiData.returnCode == 290) {
            // wrong password
            this.error = true;
            this.errorMessage = 'Wrong Password';
            this.q.notify({
              type: 'negative',
              message: 'Wrong Password.',
              progress: true,
              multiLine: false,
            });
          } else {
            this.error = true;
            this.errorMessage = apiData.errorMessage;

            this.q.notify({
              type: 'negative',
              message: apiData.errorMessage,
              progress: true,
              multiLine: false,
            });
          }
        }
        this.loading = false;
      });
    },
  },
});
</script>
