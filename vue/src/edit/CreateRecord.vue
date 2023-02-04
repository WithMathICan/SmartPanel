<template>
   <h2 class="font-normal text-green-500">Создание записи</h2>
   <h1 class="text-700 mb-2">{{ table }}</h1>
   <div class="mt-2 mb-2">
      <router-link class="link p-button" :to="{name: `view_all_${schema}_${table}`}">Все записи</router-link>
   </div>
   <Card v-if="bean && cols.length>0">
      <template #content>
         <form  v-on:submit.prevent="save">
            <EditForm :cols="cols" :bean="bean" />
            <div class="mt-3">
               <Button label="Сохранить" :loading="loading" type="submit" icon="pi pi-save" iconPos="right" class="p-button-success"></Button>
            </div>
         </form>
      </template>
   </Card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { api } from '../api.js';
import { UpdateBeans, loading } from '../store';
import Card from 'primevue/card'
import EditForm from './edit-form/EditForm.vue';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

/** @type {{schema: string, table: string}} */
let props = defineProps(['schema', 'table'])

let router = useRouter()

let bean = ref({})
let cols = ref([])
function init() {
   api[props.schema][props.table].GetCols().then(ColsObtained)
}

/** @param {import('../../../sp-server-ts-validation/classes/Col').Col[]} dataCols */
function ColsObtained(dataCols){
   if (!Array.isArray(dataCols)) return
   cols.value = dataCols
   for (let col of dataCols) if (col.column_default !== null) {
      if (col.data_type === 'date'){
         if (col.column_default.toLowerCase() === 'now()') bean.value[col.column_name] = new Date()
         let date = Date.parse(col.column_default)
         bean.value[col.column_name] = date ? new Date(date) : new Date()
      }
      else if (col.data_type === 'number') bean.value[col.column_name] = +col.column_default 
      else bean.value[col.column_name] = col.column_default
   }
}

onMounted(init)
watch(() => [props.schema, props.table], init)
function save(){
   api[props.schema][props.table].SaveBean(bean.value).then(data => {
      if (!data || !data.id) return
      router.push({name: 'edit', params: {...props, id: data.id}})
      UpdateBeans(props.schema, props.table, data)
   })
}
</script>