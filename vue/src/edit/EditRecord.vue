<template>
<h2 class="font-normal text-blue-500">Редактирование записи</h2>
<h1 class="text-700">{{table}}</h1>
{{schema}} --- {{table}} --- {{id}}

</template>

<script>
import { defineComponent, onMounted, watch } from 'vue';
import { FillColsData } from '../store';

export default defineComponent({
   props: ['schema', 'table', 'id'],

   /** @param {{schema: string, table: string, id: string}} props */
   setup({schema, table, id}){
      function init(){
         FillColsData(schema, table)
      }

      onMounted(init)
      watch(() => [schema, table, id], init)
   }
})
</script>