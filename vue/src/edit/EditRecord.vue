<template>
   <h2 class="font-normal text-blue-500">Редактирование записи</h2>
   <h1 class="text-700">{{ table }}</h1>
   <Card>
      <template #content>
         <form  v-on:submit.prevent="save">
            <EditForm :schema="schema" :table="table" :bean="bean" />
            <div class="mt-3">
               <Button label="Submit" type="submit" icon="pi pi-check" iconPos="right" class="p-button-success"></Button>
            </div>
         </form>
      </template>
   </Card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { api } from '../api.js';
import { FillColsData } from '../store';
import Card from 'primevue/card'
import EditForm from './edit-form/EditForm.vue';
import Button from 'primevue/button';

/** @type {{schema: string, table: string, id: string}} */
let props = defineProps(['schema', 'table', 'id'])

let bean = ref(null)
function init() {
   FillColsData(props.schema, props.table)
   api[props.schema][props.table].GetBean(props.id).then(data => { bean.value = data })
}

onMounted(init)
watch(() => [props.schema, props.table, props.id], init)
function save(){
   console.log('save');
   api[props.schema][props.table].SaveBean(bean.value).then(data => {
      console.log(data);
   })
}
</script>