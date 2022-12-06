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
   let data = await fetch(`${API_PATH}/init`, {method: 'POST', body: '{}'})
   if (!data.ok) return;
   let {result} = await data.json()
   if (!result) return console.log("Ошибка при получении данных с сервера");
   CreateMenuItems(result)
   CreateApi(result, API_PATH)
   let routes = CreateRoutes(result)
   const router = createRouter({ history: createWebHistory(SMART_PANEL_PATH), routes })
   createApp(App).use(PrimeVue).use(router).mount("#root")
}

start()