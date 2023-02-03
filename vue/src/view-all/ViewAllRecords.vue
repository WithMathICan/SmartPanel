<template>
   <h1 class="text-700 mb-2">{{ table }} </h1>
   <span v-if="selectedBeans.length">{{ selectedBeans.length }} выбрано</span>
   <div v-if="tableKey && Array.isArray(spBeans[tableKey])">
      <div class="mt-2 mb-2">
         <router-link class="link p-button p-button-warning" :to="{ name: 'new', params: { schema, table } }">Создать</router-link>
         <ButtonDelete :schema="schema" :table="table" :ids="ids" label="Удалить" :delete-cb="clearSelected" />
      </div>
      <DataTable responsiveLayout="scroll" :value="spBeans[tableKey]" dataKey="id" :rowHover="true" 
         v-model:filters="filters" filterDisplay="menu" v-model:selection="selectedBeans">
         <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
         <Column field="id" header="ID" :sortable="true">
            <template #body="slotProps">
               <router-link class="link p-button p-button-info" :to="linkToEdit(slotProps.data)">
                  {{ slotProps.data.id }}
               </router-link>
            </template>
            <template #filter="{filterModel}">
               <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by name"/>
            </template>
         </Column>
         <Column v-for="col of spColsData[tableKey]" :field="col.column_name" :header="col.column_name" :sortable="true">
            <template #body="slotProps">
               <ColFk v-if="col.data_type === 'fk'" :col="col" :bean="slotProps.data" />
               <ColDate v-else-if="col.data_type === 'date'" :bean="slotProps.data" :col="col" />
               <ColNumber v-else-if="col.data_type === 'number'" :bean="slotProps.data" :col="col" />
               <ColString v-else-if="col.data_type === 'varchar'" :data="slotProps.data[col.column_name].substring(0, 150)" />
            </template>
            <template #filter="{filterModel}">
               <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search"/>
            </template>
         </Column>
         <Column header="Actions">
            <template #body="slotProps">
               <ButtonDelete :schema="schema" :table="table" :ids="[slotProps.data.id]" label="" :delete-cb="clearSelected" />
               <ButtonModalEdit :schema="schema" :table="table" :id="slotProps.data.id" />
               <router-link class="link p-button p-button-secondary p-button-icon-only p-component" 
                  :to="{name: 'copy', params: {schema, table, id: slotProps.data.id}}">
                  <span class="pi pi-copy p-button-icon"></span>
               </router-link>
            </template>
         </Column>
      </DataTable>
   </div>
</template>

<script setup>
import InputText from 'primevue/inputtext';
import { onMounted, watch, ref } from 'vue'
import { FillBeans, FillColsData, spTableKey, spBeans, spColsData } from '../store';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColString from './cols/ColString.vue'
import ColFk from './cols/ColFk.vue'
import ColDate from './cols/ColDate.vue'
import ColNumber from './cols/ColNumber.vue'
import ButtonDelete from '../edit/components/ButtonDelete.vue';
import { computed } from 'vue';
import ButtonModalEdit from '../edit/components/ButtonModalEdit.vue';
import { FilterMatchMode, FilterOperator } from "primevue/api";

const props = defineProps({ schema: String, table: String })

let tableKey = ref('')
let selectedBeans = ref([])
let ids = computed(() => selectedBeans.value.map(el => el.id))

function clearSelected(deletedIds) {
   selectedBeans.value = selectedBeans.value.filter(el => !deletedIds.includes(el.id))
}

function init() {
   console.log('init ViewAllRecords');
   tableKey.value = spTableKey(props.schema, props.table)
   FillBeans(props.schema, props.table)
   FillColsData(props.schema, props.table)
}

onMounted(init)
watch(() => [props.schema, props.table], init)
function linkToEdit(bean) {
   return { name: 'edit', params: { schema: props.schema, table: props.table, id: bean.id } }
}

const filters = ref({
   global: { value: null, matchMode: FilterMatchMode.CONTAINS },
   id: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
   },
   title: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
   },
})

</script>

<style lang="scss">
.link {
   text-decoration: none;
   font-weight: 900;
   display: inline-block;
}
</style>