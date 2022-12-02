<template>
   <span>{{bean[col.column_name]}}</span>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import {Col} from 'common/col'

export default defineComponent({
   props: ['bean', 'col'],

   /** @param {{bean: any, col: Col}} props */
   setup({bean, col}){
      onMounted(() => bean[col.column_name] = +bean[col.column_name])
   }
})
</script>