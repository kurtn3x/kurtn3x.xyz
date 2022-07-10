import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from './plugins/font-awesome'

// CHANGE BASE URL DEPENDING ON PRODUCTION OR DEVELOPEMENT
axios.defaults.baseURL = 'https://api.kurtn3x.xyz'

createApp(App).use(store).use(router, axios).mount('#app')
