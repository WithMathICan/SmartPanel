<template>
<h1 class="text-700">{{table}}</h1>
<div v-if="tableKey && Array.isArray(spBeans[tableKey])">
<DataTable  responsiveLayout="scroll" :value="spBeans[tableKey]" dataKey="id" :rowHover="true" v-model:selection="selectedBeans"  >
   <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
   <span v-for="col of spColsData[tableKey]">
      <Column :field="col.column_name" :header="col.column_name" >
         <template #body="slotProps">
            <ColId v-if="col.column_name === 'id'" :bean="slotProps.data" :schema="schema" :table="table" />
            <ColString v-if="col.data_type === 'varchar'" :data="slotProps.data[col.column_name].substring(0, 150)"/>
            <ColFk v-if="col.data_type === 'fk'" :col="col" :bean="slotProps.data" />
         </template>
      </Column>
   </span>
</DataTable>
</div>
</template>

<script setup>
import {defineProps, onMounted, watch, ref} from 'vue'
import { FillBeans, FillColsData, spTableKey, spBeans, spColsData } from '../store';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColId from './cols/ColId.vue'
import ColString from './cols/ColString.vue'
import ColFk from './cols/ColFk.vue'

const props = defineProps({schema: String, table: String})

let tableKey = ref('')
let selectedBeans = ref([])

function init(){
   console.log(`Init ${props.table}`);
   tableKey.value = spTableKey(props.schema, props.table)
   FillBeans(props.schema, props.table)
   FillColsData(props.schema, props.table)
}

onMounted(init)
watch(() => [props.schema, props.table], init)

</script>