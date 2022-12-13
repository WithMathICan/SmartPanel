<template>
   <div :class="gridClass" ref="root">
      <slot></slot>
   </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
let root = ref(null)
let gridClass = ref('dynamic-grid grid-1')
function setGridClass(){
   if (root.value.clientWidth > 600) gridClass.value = 'dynamic-grid grid-2'
   else gridClass.value = 'dynamic-grid grid-1'
}
onMounted(() => {
   setGridClass()
   window.addEventListener('resize', setGridClass);
})

onUnmounted(() => {
   window.removeEventListener('resize', setGridClass);
})
</script>

<style lang="scss" scoped>
.dynamic-grid{
   display: grid;
}

.grid-2{
   grid-template-columns: 1fr 1fr;
   column-gap: 10px;
   row-gap: 10px;
}

.grid-1{
   grid-template-columns: 1fr;
   row-gap: 10px;
}
</style>