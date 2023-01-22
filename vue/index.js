// ------------------------------------- CSS
// import 'primevue/resources/themes/saga-purple/theme.css'
import 'primevue/resources/themes/lara-light-blue/theme.css'
// import 'primevue/resources/themes/saga-purple/theme.css'
// import 'primevue/resources/themes/lara-light-purple/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import './index.scss'

// -------------------------------------- JS
import { createApp } from 'vue';
import App from './src/App.vue';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import { CreateMenuItems } from './src/menu-items';
import { API_PATH } from './config'
import { createRouter, createWebHistory } from 'vue-router'
import { CreateRoutes } from './src/router';
import { CreateApi } from './src/api';

async function start() {
   try{
      let data = await fetch(`${API_PATH}/init`, {method: 'POST', body: '{}', headers: { 'Accept': 'application/json' }})
      if (!data.ok) return;
      // console.log(data);
      let {result} = await data.json()
      if (!result) return console.log("Ошибка при получении данных с сервера");
      CreateMenuItems(result)
      CreateApi(result, API_PATH)
      let routes = CreateRoutes(result)
      const router = createRouter({ history: createWebHistory(), routes })
      createApp(App).use(PrimeVue).use(ConfirmationService).use(router).mount("#root")
   } catch (e){
      console.log(e);
   }
}

start()