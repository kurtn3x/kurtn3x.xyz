import { Notify } from 'quasar';
import { boot } from 'quasar/wrappers';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot((/* { app, router, ... } */) => {
  Notify.setDefaults({
    position: 'bottom',
    timeout: 2500,
    textColor: 'white',
    actions: [{ icon: 'close', color: 'white', round: true }],
    progress: true,
  });
});
