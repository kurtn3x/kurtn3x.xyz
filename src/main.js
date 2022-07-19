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
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faRightToBracket, faUserPlus, faUser } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faRightToBracket, faUserPlus, faUser)

// CHANGE BASE URL DEPENDING ON PRODUCTION OR DEVELOPEMENT
axios.defaults.baseURL = 'https://test.kurtn3x.xyz';
// 
const Vue = createApp(App);
Vue.use(router);
Vue.use(VueAxios, axios);
Vue.use(store);
Vue.use(NavPlugin );
Vue.use(Notifications);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.mount('#app');
// createApp(App).use(router, axios, store, BootstrapVue3).mount('#app')
