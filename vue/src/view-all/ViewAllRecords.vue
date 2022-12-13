<template>
   <h1 class="text-700 mb-2">{{ table }}</h1>
   <div v-if="tableKey && Array.isArray(spBeans[tableKey])">
      <div class="mt-2 mb-2">
         <router-link class="link p-button p-button-warning" :to="{ name: 'new', params: { schema, table } }">Создать</router-link>
         <ButtonDelete :schema="schema" :table="table" :ids="ids" label="Удалить" :delete-cb="clearSelected" />
      </div>
      <DataTable responsiveLayout="scroll" :value="spBeans[tableKey]" dataKey="id" :rowHover="true" v-model:selection="selectedBeans">
         <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
         <Column field="id" header="ID">
            <template #body="slotProps">
               <router-link class="link p-button p-button-info" :to="linkToEdit(slotProps.data)">
                  {{ slotProps.data.id }}
               </router-link>
            </template>
         </Column>
         <Column v-for="col of spColsData[tableKey]" :field="col.column_name" :header="col.column_name">
            <template #body="slotProps">
               <ColFk v-if="col.data_type === 'fk'" :col="col" :bean="slotProps.data" />
               <ColDate v-else-if="col.data_type === 'date'" :bean="slotProps.data" :col="col" />
               <ColNumber v-else-if="col.data_type === 'number'" :bean="slotProps.data" :col="col" />
               <ColString v-else-if="col.data_type === 'varchar'" :data="slotProps.data[col.column_name].substring(0, 150)" />
            </template>
         </Column>
         <Column header="Actions">
            <template #body="slotProps">
               <ButtonDelete :schema="schema" :table="table" :ids="[slotProps.data.id]" label="" :delete-cb="clearSelected" />
               <ButtonModalEdit :schema="schema" :table="table" :id="slotProps.data.id" />
            </template>
         </Column>
      </DataTable>
   </div>
</template>

<script setup>
import { defineProps, onMounted, watch, ref } from 'vue'
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

const props = defineProps({ schema: String, table: String })

let tableKey = ref('')
let selectedBeans = ref([])
let ids = computed(() => selectedBeans.value.map(el => el.id))

function clearSelected(deletedIds) {
   selectedBeans.value = selectedBeans.value.filter(el => !deletedIds.includes(el.id))
}

function init() {
   tableKey.value = spTableKey(props.schema, props.table)
   FillBeans(props.schema, props.table)
   FillColsData(props.schema, props.table)
}

onMounted(init)
watch(() => [props.schema, props.table], init)
function linkToEdit(bean) {
   return { name: 'edit', params: { schema: props.schema, table: props.table, id: bean.id } }
}

</script>

<style lang="scss">
.link {
   text-decoration: none;
   font-weight: 900;
}
</style>