// ------------------------------------- CSS
// import 'primevue/resources/themes/saga-purple/theme.css'
import 'primevue/resources/themes/lara-light-purple/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import './index.scss'

// -------------------------------------- JS
import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import { CreateMenuItems } from './menu-items';
import { API_PATH, SMART_PANEL_PATH } from '../config'
import { createRouter, createWebHistory } from 'vue-router'
import { CreateRoutes } from './router';
import { CreateApi } from './api';

async function start() {
   let data = await fetch(`${API_PATH}/init`)
   if (!data.ok) return;
   let tables = await data.json()
   CreateMenuItems(tables)
   CreateApi(tables, API_PATH)
   let routes = CreateRoutes(tables)
   const router = createRouter({ history: createWebHistory(SMART_PANEL_PATH), routes })
   createApp(App).use(PrimeVue).use(router).mount("#root")
}

start()