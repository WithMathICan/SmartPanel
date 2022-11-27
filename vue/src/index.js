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
import {SMART_PANEL_PATH} from '../config'
import {createRouter, createWebHistory} from 'vue-router'
import { CreateRoutes } from './router';

async function start() {
   let data = await fetch('http://localhost:3000/api/init')
   if (!data.ok) return;
   let tables = await data.json()
   CreateMenuItems(tables)
   let routes = CreateRoutes(tables)
   const router = createRouter({ history: createWebHistory(SMART_PANEL_PATH), routes})
   createApp(App).use(PrimeVue).use(router).mount("#root")
}

start()