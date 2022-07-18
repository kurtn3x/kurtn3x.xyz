import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import NavPlugin  from 'bootstrap-vue-3'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import Notifications from '@kyvg/vue3-notification'

// CHANGE BASE URL DEPENDING ON PRODUCTION OR DEVELOPEMENT
axios.defaults.baseURL = 'https://test.kurtn3x.xyz';
// 
const Vue = createApp(App);
Vue.use(router);
Vue.use(VueAxios, axios);
Vue.use(store);
Vue.use(NavPlugin );
Vue.use(Notifications);
Vue.mount('#app');
// createApp(App).use(router, axios, store, BootstrapVue3).mount('#app')
