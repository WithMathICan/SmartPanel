<template>
   <h2 class="font-normal text-blue-500">Копирование записи</h2>
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
               <router-link class="link p-button" :to="{name: 'copy', params: {schema, table, id}}">Все записи</router-link>
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

/** @type {{schema: string, table: string, id: string}} */
let props = defineProps(['schema', 'table', 'id'])

let bean = ref(null)
let cols = ref([])
let router = useRouter()
function init() {
   api[props.schema][props.table].GetCols().then(data => cols.value = data ?? [])
   api[props.schema][props.table].GetBean(props.id).then(data => {
      if (!data) return
      delete data.id
      bean.value = data
   })
}

onMounted(init)
watch(() => [props.schema, props.table, props.id], init)
function save(){
   api[props.schema][props.table].SaveBean(bean.value).then(data => {
      if (!data || !data.id) return
      router.push({name: 'edit', params: {...props, id: data.id}})
      UpdateBeans(props.schema, props.table, data)
   })
}
</script>