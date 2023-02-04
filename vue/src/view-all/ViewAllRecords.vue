<template>
   <h1 class="text-700 mb-2">{{ table }} </h1>
   {{ filters }}
   <span v-if="selectedBeans.length">{{ selectedBeans.length }} выбрано</span>
   <div v-if="tableKey && Array.isArray(spBeans[tableKey])">
      <div class="mt-2 mb-2">
         <router-link class="link p-button p-button-warning" :to="{ name: 'new', params: { schema, table } }">Создать</router-link>
         <ButtonDelete :schema="schema" :table="table" :ids="ids" label="Удалить" :delete-cb="clearSelected" />
      </div>
      <DataTable responsiveLayout="scroll" :value="spBeans[tableKey]" dataKey="id" :rowHover="true" 
         v-model:filters="filters" filterDisplay="menu" v-model:selection="selectedBeans" :rows="5" :paginator="true"
         paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" 
         :rowsPerPageOptions="[2, 5,10,25,50,100]" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
         stateStorage="session" :stateKey="`dt-state-session-${schema}-${table}`"
         :global-filter-fields="['title', 'id']"
      >
         <template #header>
            <div class="flex justify-content-between">
               <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined" @click="filters=createFilters()"/>
               <span class="p-input-icon-left">
                  <i class="pi pi-search"></i>
                  <InputText v-model="filters['glob'].value" placeholder="Пошук" />
               </span>
            </div>
         </template>
         <template #empty><h3 class="text-pink-500">Записей нет</h3></template>
         <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
         <Column field="id" header="ID" :sortable="true">
            <template #body="slotProps">
               <router-link class="link p-button p-button-info" :to="linkToEdit(slotProps.data)">
                  {{ slotProps.data.id }}
               </router-link>
            </template>
            <template #filter="{filterModel}">
               <InputText type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search by ID"/>
            </template>
         </Column>
         <Column v-for="col of spColsData[tableKey]" :field="col.column_name" :header="col.column_name" :sortable="true" 
               :data-type="findDataType(col)" :showFilterMatchModes="!col.fk">
            <template #body="slotProps">
               <ColFk v-if="col.data_type === 'fk'" :col="col" :bean="slotProps.data" />
               <ColDate v-else-if="col.data_type === 'date'" :bean="slotProps.data" :col="col" />
               <ColNumber v-else-if="col.data_type === 'number'" :bean="slotProps.data" :col="col" />
               <ColString v-else-if="col.data_type === 'varchar'" :data="slotProps.data[col.column_name]?.substring(0, 150)" />
            </template>
            <template #filter="{filterModel}">
               <Calendar v-if="col.data_type === 'date'" v-model="filterModel.value" dateFormat="dd-mm-yy" placeholder="dd-mm-yyyy" />
               <MultiSelect v-else-if="col.fk && Array.isArray(spBeans[spTableKey(col.fk.foreign_table_schema, col.fk.foreign_table_name)])" 
                  v-model="filterModel.value" 
                  :filter="spBeans[spTableKey(col.fk.foreign_table_schema, col.fk.foreign_table_name)].length > 5"
                  :options="spBeans[spTableKey(col.fk.foreign_table_schema, col.fk.foreign_table_name)]" 
                  :optionLabel="col.fk.foreign_title_column_name" 
                  :option-value="col.fk.foreign_column_name"
                  placeholder="Any" class="p-column-filter">
               </MultiSelect>
               <InputNumber v-else-if="col.data_type === 'number'" v-model="filterModel.value" mode="decimal" :min-fraction-digits="0" :max-fraction-digits="5" />
               <InputText v-else type="text" v-model="filterModel.value" class="p-column-filter" placeholder="Search"/>
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
// import {} from 'primevue/datatable';
import Column from 'primevue/column';
import ColString from './cols/ColString.vue'
import ColFk from './cols/ColFk.vue'
import ColDate from './cols/ColDate.vue'
import ColNumber from './cols/ColNumber.vue'
import ButtonDelete from '../edit/components/ButtonDelete.vue';
import { computed } from 'vue';
import ButtonModalEdit from '../edit/components/ButtonModalEdit.vue';
import { FilterMatchMode, FilterOperator } from "primevue/api";
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import MultiSelect from 'primevue/multiselect';  
import Button from 'primevue/button';
// import Row from 'primevue/row';        

const props = defineProps({ 
   schema: {type: String, required: true}, 
   table: {type: String, required: true },
})

let tableKey = ref('')
let selectedBeans = ref([])
let ids = computed(() => selectedBeans.value.map(el => el.id))

function clearSelected(deletedIds) {
   selectedBeans.value = selectedBeans.value.filter(el => !deletedIds.includes(el.id))
}

const filters = ref(createFilters())

function createFilters(){
   let cols = spColsData[spTableKey(props.schema, props.table)]
   let filter = {
      glob: {value: null, matchMode: FilterMatchMode.CONTAINS},
      id: {
         operator: FilterOperator.AND,
         constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS}],
      }
   }
   if (!cols) return filter
   for (let col of cols){
      if (col.fk){
         filter[col.column_name] = {value: null, matchMode: FilterMatchMode.IN}
      }
      else{
         let matchMode = col.data_type === 'date' 
            ? FilterMatchMode.DATE_IS
            : col.data_type === 'number'
               ? FilterMatchMode.EQUALS
               : FilterMatchMode.CONTAINS
         filter[col.column_name] = {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode }],
         }
      }
   }
   return filter
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

// const filters = ref({
//    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//    id: {
//       operator: FilterOperator.AND,
//       constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
//    },
//    title: {
//       operator: FilterOperator.AND,
//       constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
//    },
// })

/** @param {import('../api').Col} col */
function findDataType(col){
   if (col.data_type === 'date') return 'date'
   else if (col.data_type === 'number') return 'numeric'
   return 'text'
}

</script>

<style lang="scss">
.link {
   text-decoration: none;
   font-weight: 900;
   display: inline-block;
}
</style>