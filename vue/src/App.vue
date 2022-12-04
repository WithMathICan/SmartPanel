<template>
   <Menubar :model="menu_items"></Menubar>
   <div class="container p-2">
      <router-view></router-view>
   </div>
</template>

<script setup>
import {menu_items} from './menu-items'
import Menubar from 'primevue/menubar';

</script>

