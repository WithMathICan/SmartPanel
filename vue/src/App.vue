<template>
   <Menubar :model="menu_items"></Menubar>
   <div class="container p-2">
      <router-view></router-view>
      <div id="toast-container">
         <transition-group name="p-message" tag="div">
            <Message v-for="msg of messages"  
               :life="msg.life"
               :closable="msg.closable"
               :severity="msg.severity"
               :key="msg.id" 
               v-on:close="msgClose(msg.id)"
            >
               {{msg.content}}
            </Message>
        </transition-group>
      </div>
   </div>
</template>

<script setup>
import {menu_items} from './menu-items'
import Menubar from 'primevue/menubar';
import {messages, msgClose} from './messages'
import Message from 'primevue/message'
</script>

<style lang="scss">
#toast-container{
   position: absolute;
   bottom: 0;
   left: 0;
   width: 100%;
   padding: 0 10px;
}
</style>

