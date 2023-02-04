<template>
   <h2 class="font-normal text-blue-500">Редактирование записи</h2>
   <h1 class="text-700 mb-2">{{ table }}</h1>
   <div class="mt-2 mb-2">
      <router-link class="link p-button" :to="{name: `view_all_${schema}_${table}`}">Все записи</router-link>
      <router-link class="link p-button p-button-warning" :to="{name: 'new', params: {schema, table}}">Создать</router-link>
   </div>
   <Card v-if="bean && cols.length>0">
      <template #content>
         <form  v-on:submit.prevent="save">
            <EditForm :cols="cols" :bean="bean" />
            <div class="mt-3">
               <Button label="Сохранить" :loading="loading" type="submit" icon="pi pi-save" iconPos="right" class="p-button-success mr-1"></Button>
               <router-link class="link p-button mr-1" :to="{name: 'copy', params: {schema, table, id}}">Копировать</router-link>
               <router-link class="link p-button p-button-warning mr-1" :to="{name: 'new', params: {schema, table}}">Создать</router-link>
               <ButtonDelete :schema="schema" :table="table" :ids="[id]" :deleteCb="GoToAll" />
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
import ButtonDelete from './components/ButtonDelete.vue';
import { useRouter } from 'vue-router';


/** @type {{schema: string, table: string, id: string}} */
let props = defineProps(['schema', 'table', 'id'])

let bean = ref(null)
let cols = ref([])
function init() {
   api[props.schema][props.table].GetCols().then(data => cols.value = data ?? [])
   api[props.schema][props.table].GetBean(props.id).then(data => bean.value = data)
}

onMounted(init)
watch(() => [props.schema, props.table, props.id], init)
function save(){
   api[props.schema][props.table].SaveBean(bean.value).then(data => {
      UpdateBeans(props.schema, props.table, data)
   })
}

let router = useRouter()

function GoToAll(){
   let name = `view_all_${props.schema}_${props.table}`
   router.push({ name })
}
</script>