<template>
   <Menubar :model="menu_items"></Menubar>
   <router-view></router-view>
</template>

<script setup>
import {menu_items} from './menu-items'
import Menubar from 'primevue/menubar';

</script>

