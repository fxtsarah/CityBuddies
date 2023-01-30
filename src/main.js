import axios from 'axios';
// Vue.prototype.$http = axios;

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
