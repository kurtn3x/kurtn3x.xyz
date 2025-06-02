<template>
  <div :class="isDarkMode ? 'text-white' : 'text-dark'">
    <q-card
      flat
      class="bg-transparent q-ma-sm"
    >
      <div class="text-h4 text-center q-mt-lg">Profile Settings</div>

      <q-card-section class="flex justify-center">
        <q-form
          class="q-gutter-md"
          @submit.prevent="handleUpdateUserProfile"
          style="max-width: 500px; width: 100%"
        >
          <q-input
            v-model="editableProfile.name"
            class="q-mb-md"
            input-class="text-body1"
            label="Name"
            :color="isDarkMode ? 'white' : 'black'"
            outlined
            lazy-rules
            :rules="[(val) => val.length < 50 || 'Max Length = 50 characters']"
          />

          <q-input
            v-model="editableProfile.location"
            class="q-mb-md"
            input-class="text-body1"
            label="Location"
            :color="isDarkMode ? 'white' : 'black'"
            outlined
            lazy-rules
            :rules="[(val) => val.length < 50 || 'Max Length = 50 characters']"
          />

          <q-input
            v-model="editableProfile.status"
            class="q-mb-md"
            input-class="text-body1"
            label="Status"
            :color="isDarkMode ? 'white' : 'black'"
            outlined
            lazy-rules
            :rules="[(val) => val.length < 15 || 'Max Length = 15 characters']"
          />

          <q-input
            v-model="editableProfile.description"
            class="q-mb-md"
            input-class="text-body1"
            label="Description"
            :color="isDarkMode ? 'white' : 'black'"
            type="textarea"
            outlined
            lazy-rules
            :rules="[(val) => val.length < 255 || 'Max Length = 255 characters']"
          />

          <div class="text-center q-mt-lg">
            <q-avatar
              size="150px"
              class="q-mb-md"
            >
              <img :src="settingsStore.avatarPreview as string" />
            </q-avatar>
          </div>

          <q-file
            v-model="avatar"
            label="Upload Image"
            :color="isDarkMode ? 'white' : 'black'"
            outlined
            max-file-size="2048000"
            accept=".jpg, .png, .gif, .jpeg"
            counter
            @update:model-value="onAvatarSelect"
            @rejected="onRejected"
            class="q-mb-sm"
          >
            <template v-slot:prepend>
              <q-icon name="photo" />
            </template>
          </q-file>

          <div class="text-caption text-center q-mt-sm">
            Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
            <br />
            Recommended Profile Picture Aspect Ratio: Square
          </div>

          <div class="text-center q-mt-xl">
            <q-btn
              size="lg"
              color="green"
              label="Save Changes"
              type="submit"
              push
              :loading="localLoading"
              class="q-px-xl full-width"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { useSettingsStore } from 'src/stores/settingsStore';
import type { UserProfileUpdate } from 'src/types/apiTypes';

// Setup composables
const q = useQuasar();
const localStore = useLocalStore();
const settingsStore = useSettingsStore();
const localLoading = ref(false);

// State variables
const avatar = ref<File | null>(null);
const editableProfile = ref({
  ...settingsStore.accountSettings.profile,
} as UserProfileUpdate);

// Computed properties
const isDarkMode = computed(() => localStore.isDarkMode);

// Methods
const onAvatarSelect = () => {
  settingsStore.setAvatarPreview(avatar.value);
};

const onRejected = () => {
  q.notify({
    type: 'negative',
    message: "Selected Picture doesn't meet the requirements.",
  });
};

const handleUpdateUserProfile = async () => {
  localLoading.value = true;
  if (avatar.value) {
    editableProfile.value.avatar = avatar.value;
  }
  await settingsStore.updateProfile(editableProfile.value);
  localLoading.value = false;
};
</script>
