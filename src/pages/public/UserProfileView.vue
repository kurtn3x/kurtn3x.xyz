<template>
  <div
    v-if="state.loading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div v-if="!state.loading && state.error">
    <ErrorPage :error-message="state.errorMessage" />
  </div>
  <div v-if="!state.loading && !state.error">
    <q-page class="q-pa-sm">
      <!-- Desktop Layout Component -->
      <q-card
        bordered
        flat
        class="bg-primary text-layout-text profile-header"
      >
        <div class="row items-center q-mt-md q-mb-md">
          <!-- Avatar Section -->
          <div class="gt-xs">
            <q-avatar
              rounded
              size="180px"
              class="bg-transparent q-ml-md shadow-4"
            >
              <q-img
                :src="user.avatarUrl"
                class="full-height full-width"
              />
            </q-avatar>
          </div>

          <div class="lt-sm">
            <q-avatar
              rounded
              size="120px"
              class="bg-transparent q-ml-md shadow-4"
            >
              <q-img
                :src="user.avatarUrl"
                class="full-height full-width"
              />
            </q-avatar>
          </div>

          <!-- User Info Section -->
          <div class="col">
            <div class="text-h3 gt-xs text-weight-bold text3d-primary q-ml-lg non-selectable">
              {{ user.username }}
            </div>
            <div class="text-h4 lt-sm text-weight-bold text3d-primary q-ml-lg non-selectable">
              {{ user.username }}
            </div>
            <q-btn
              flat
              rounded
              dense
              color="white"
              icon="share"
              class="q-ma-md absolute-top-right"
            >
              <q-menu
                anchor="center start"
                self="center end"
              >
                <q-input
                  filled
                  square
                  :model-value="userlink"
                  readonly
                />
                <q-item
                  clickable
                  @click="copyToClipboard(userlink)"
                  class="justify-center text-body1"
                >
                  Copy the link
                </q-item>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-card>

      <q-card
        flat
        class="bg-transparent profile-card q-mt-sm"
      >
        <q-separator size="1px" />
        <q-card
          flat
          class="full-width full-height bg-transparent"
        >
          <div class="row q-col-gutter-md">
            <!-- Left Column - User Details -->
            <div class="col-12 col-md-5">
              <q-card
                flat
                bordered
              >
                <q-card-section class="bg-primary text-layout-text q-py-sm">
                  <div class="text-h6">User Information</div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-list separator>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon
                          color="primary"
                          name="person"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label overline>Full Name</q-item-label>
                        <q-item-label>
                          {{ user.name || 'Not specified' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon
                          color="primary"
                          name="place"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label overline>Location</q-item-label>
                        <q-item-label>
                          {{ user.location || 'Not specified' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon
                          color="primary"
                          name="event"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label overline>Member Since</q-item-label>
                        <q-item-label>
                          {{ user.dateJoined || 'Not available' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon
                          color="primary"
                          name="mood"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label overline>Current Status</q-item-label>
                        <q-item-label>
                          {{ user.status || 'Not specified' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon
                          color="primary"
                          name="shield"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label overline>Role</q-item-label>
                        <q-item-label>
                          <q-badge
                            :color="user.role === 'Admin' ? 'negative' : 'info'"
                            class="q-pa-xs"
                          >
                            {{ user.role || 'User' }}
                          </q-badge>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <!-- Right Column - Description/Bio -->
            <div class="col-12 col-md-7">
              <q-card
                flat
                bordered
                class="full-height"
              >
                <q-card-section class="bg-primary text-layout-text q-py-sm">
                  <div class="text-h6">Description</div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div
                    class="text-body1"
                    style="white-space: pre-line"
                  >
                    {{ user.description || 'This user has not added a description yet.' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card>
      </q-card>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from 'src/api/profile.ts';
import ErrorPage from 'src/components/ErrorPage.vue';
import { copyToClipboard } from 'src/components/lib/functions';

// Use the extracted profile functionality
const { state, user, userlink } = useUserProfile();
</script>

<style scoped>
.profile-card {
  min-height: calc(100vh - 300px);
}
</style>
