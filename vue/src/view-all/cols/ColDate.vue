<template>
   <span>{{showDate()}}</span>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import {Col} from 'common/col'
export default defineComponent({
   props: ['bean', 'col'],

   /** @param {{bean: any, col: Col}} props */
   setup({bean, col}){
      onMounted(() => bean[col.column_name] = new Date(bean[col.column_name]))
      /** @param {Date} data */
      function showDate(){
         let date = new Date(bean[col.column_name])
         return new Intl.DateTimeFormat("ru", { dateStyle: 'short', timeStyle: 'short' }).format(date)
      }

      return {showDate}
   }
})


</script>