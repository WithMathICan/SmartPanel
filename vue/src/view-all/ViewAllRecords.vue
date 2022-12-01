<template>
<h1 class="text-700">{{table}}</h1>
<div v-if="tableKey && Array.isArray(spBeans[tableKey])">
<DataTable  responsiveLayout="scroll" :value="spBeans[tableKey]" dataKey="id" :rowHover="true" v-model:selection="selectedBeans"  >
   <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
   <Column v-for="col of spColsData[tableKey]" :field="col.column_name" :header="col.column_name"></Column>
</DataTable>
</div>
</template>

<script setup>
import {defineProps, onMounted, watch, ref} from 'vue'
import { FillBeans, FillColsData, spTableKey, spBeans, spColsData } from '../store';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

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