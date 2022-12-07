<template>
   <h2 class="font-normal text-blue-500">Редактирование записи</h2>
   <h1 class="text-700">{{ table }}</h1>
   <Card>
      <template #content>
         <EditForm :schema="schema" :table="table" :bean="bean" />
      </template>
   </Card>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { api } from '../api';
import { FillColsData, spTableKey, spColsData } from '../store';
import Card from 'primevue/card'
import EditForm from './edit-form/EditForm.vue';
let props = defineProps({ schema: String, table: String, id: String })

let bean = ref(null)
function init() {
   FillColsData(props.schema, props.table)
   api[props.schema][props.table].GetBean(props.id).then(data => { bean.value = data })
}

onMounted(init)
watch(() => [props.schema, props.table, props.id], init)

</script>