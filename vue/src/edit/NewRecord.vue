<template>
   <h2 class="font-normal text-blue-500">Редактирование записи</h2>
   <h1 class="text-700 mb-2">{{ table }}</h1>
   <div class="mt-2 mb-2">
      <router-link class="link p-button" :to="{name: `view_all_${schema}_${table}`}">Все записи</router-link>
   </div>
   <Card>
      <template #content>
         <form  v-on:submit.prevent="save">
            <EditForm :schema="schema" :table="table" :bean="bean" />
            <div class="mt-3">
               <Button label="Сохранить" type="submit" icon="pi pi-save" iconPos="right" class="p-button-success"></Button>
            </div>
         </form>
      </template>
   </Card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { api } from '../api.js';
import { FillColsData, UpdateBeans } from '../store';
import Card from 'primevue/card'
import EditForm from './edit-form/EditForm.vue';
import Button from 'primevue/button';

/** @type {{schema: string, table: string}} */
let props = defineProps(['schema', 'table'])

let bean = ref({})
function init() {
   FillColsData(props.schema, props.table)
}

onMounted(init)
watch(() => [props.schema, props.table], init)
function save(){
   api[props.schema][props.table].SaveBean(bean.value).then(data => {
      UpdateBeans(props.schema, props.table, data)
   })
}
</script>