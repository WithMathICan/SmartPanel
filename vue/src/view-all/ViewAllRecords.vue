<template>
   <h1 class="text-700 mb-2">{{ table }} </h1>
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
      >
         <template #header>
            <div class="flex justify-content-between align-items-center">
               <Button type="button" icon="pi pi-filter-slash" label="Clear" class="p-button-outlined" @click="filters=createFilters()"/>
               <span v-if="selectedBeans.length" class="text-blue-600">{{ selectedBeans.length }} выбрано</span>
            </div>
            <div style="text-align:left" v-if="Array.isArray(spColsData[tableKey])">
               <MultiSelect :modelValue="selectedColumns" :options="[...spColsData[tableKey]].sort(sortCols)" optionLabel="column_name" 
                  placeholder="Select Columns" style="width: 100%" display="chip" @update:modelValue="onToggle"/>
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
         <Column v-for="col of selectedColumns" :field="col.column_name" :header="col.column_name" :sortable="true" 
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
import { onMounted, watch, ref, computed } from 'vue'
import { FillBeans, FillColsData, spTableKey, spBeans, spColsData } from '../store';
import DataTable from 'primevue/datatable';
// import {} from 'primevue/datatable';
import Column from 'primevue/column';
import ColString from './cols/ColString.vue'
import ColFk from './cols/ColFk.vue'
import ColDate from './cols/ColDate.vue'
import ColNumber from './cols/ColNumber.vue'
import ButtonDelete from '../edit/components/ButtonDelete.vue';
import ButtonModalEdit from '../edit/components/ButtonModalEdit.vue';
import { FilterMatchMode, FilterOperator } from "primevue/api";
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import MultiSelect from 'primevue/multiselect';  
import Button from 'primevue/button';
// import Row from 'primevue/row';  

/**
* @param {import('../api').Col} col1
* @param {import('../api').Col} col2
*/
function sortCols(col1, col2){
   if (col1.column_name < col2.column_name) return -1
   if (col1.column_name > col2.column_name) return 1
   return 0
}

const props = defineProps({ 
   schema: {type: String, required: true}, 
   table: {type: String, required: true },
})

let tableKey = computed(() => spTableKey(props.schema, props.table))
let selectedBeans = ref([])
let ids = computed(() => selectedBeans.value.map(el => el.id))

function clearSelected(deletedIds) {
   selectedBeans.value = selectedBeans.value.filter(el => !deletedIds.includes(el.id))
}

const filters = ref(createFilters())

function createFilters(){
   let cols = spColsData[tableKey.value]
   let filter = {
      // glob: {value: null, matchMode: FilterMatchMode.CONTAINS},
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

/** @type {import('vue').Ref<import('../api').Col[]>} */
let selectedColumns = ref([])

let localStorageKey = computed(() => `key-view-all-${props.schema}-${props.table}`)

/** @param {import('../api').Col[]} val*/
function onToggle(val) {
   if (!Array.isArray(val)) return
   localStorage.setItem(localStorageKey.value, val.map(col => col.column_name).join(','))
   if (Array.isArray(spColsData[tableKey.value])){
      selectedColumns.value = spColsData[tableKey.value].filter(col => val.includes(col));
   }
};

/** @param {import('../api').Col[]} cols*/
function setInitialCols(cols){
   let fields = localStorage.getItem(localStorageKey.value)
   if (fields){
      let arr_fields = fields.split(',')
      selectedColumns.value = cols.filter(col => arr_fields.includes(col.column_name))
   }
   else selectedColumns.value = cols
}

function init() {
   console.log('init ViewAllRecords');
   FillBeans(props.schema, props.table)
   FillColsData(props.schema, props.table).then(setInitialCols)
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