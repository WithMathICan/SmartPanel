<template>
   <Menubar :model="menu_items"></Menubar>
   <div class="container p-2">
      <router-view></router-view>
      <Toast position="bottom-left" group="bl"/>
      {{messages}}
      <div id="toast-container">
         <transition-group name="p-message" tag="div">
            <Message v-for="msg of messages"  
               :life="msg.life"
               :closable="msg.closable"
               :severity="msg.severity"
               :key="msg.id" 
               v-on:close="msgClose(msg.id)"
            >{{msg.content}}</Message>
        </transition-group>
      </div>
   </div>
</template>

<script setup>
import {menu_items} from './menu-items'
import Menubar from 'primevue/menubar';
import Toast from 'primevue/toast';
import { onMounted } from 'vue';
import {messages, showMessage, msgClose} from './messages'
import Message from 'primevue/message'
onMounted(() => {
   // addMessage('Test mesage', 7000, 'info')
   // addMessage('Test mesage 2', 5000, 'error')
   for (let i = 0; i < 20; i++){
      setTimeout(() => showMessage("Multiple message", 1000, 'warn'), i*1000)
   }
})
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

