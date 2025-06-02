<template>
  <q-page class="flex justify-center full-width">
    <q-card
      flat
      class="full-width fade-in-text q-mt-lg text-layout-text"
      style="background-color: transparent; max-width: 600px"
    >
      <q-expansion-item
        label="Cookies"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg q-mr-sm q-ml-sm"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <q-list bordered class="q-ma-sm">
          <div class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-sm text-layout-text">
            Only used for Authorization and CSRF-Prevention. No 3rd-party cookies.
          </div>
        </q-list>
      </q-expansion-item>
      <q-separator color="layout-text" class="q-mr-sm q-ml-sm" />
      <q-expansion-item
        label="Privacy Policy"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg q-mr-sm q-ml-sm"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <q-list bordered class="q-ma-sm">
          <div class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md text-layout-text">
            Only data related to an account is stored. No logs are saved.
          </div>
        </q-list>
      </q-expansion-item>
      <q-separator color="layout-text" class="q-mr-sm q-ml-sm" />
      <q-expansion-item
        label="Contact"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg q-mr-sm q-ml-sm"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <q-list bordered class="q-ma-sm">
          <div class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md text-layout-text">
            <a href="https://about.kurtn3x.xyz" target="_blank" class="text-layout-text">
              about.kurtn3x.xyz
            </a>
          </div>
        </q-list>
      </q-expansion-item>
    </q-card>
  </q-page>
</template>

<style scoped lang="scss">
.fade-in-text {
  animation: fadeIn 3s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.q-page {
  padding-top: 3rem;
}
</style>
