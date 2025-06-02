import { loadSlim } from '@tsparticles/slim';
import Particles from '@tsparticles/vue3';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(Particles, {
    init: async (engine) => {
      await loadSlim(engine);
    },
  });
});

export { Particles };
