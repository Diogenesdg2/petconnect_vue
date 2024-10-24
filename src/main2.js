import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './firebaseDB'
import 'bootstrap/dist/css/bootstrap.min.css'  
import 'jquery';  
import 'popper.js';  
import 'bootstrap/dist/js/bootstrap.min.js'





const app = createApp(App)

app.use(router)

app.mount('#app')
