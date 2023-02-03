<template>
   <Button type="button" icon="pi pi-pencil" iconPos="right" class="p-button-info" @click="openModalEdit"></Button>
   <Dialog header="Редактирование" v-model:visible="showDialog" :modal="true" :breakpoints="{ '960px': '95vw' }"
      :style="{ width: '1200px' }" :maximizable="true">
      <form v-on:submit.prevent="save">
         <EditForm :cols="cols" :bean="bean" v-if="bean" />
         <div class="mt-2">
            <Button label="Отмена" class="p-button-secondary mr-1"></Button>
            <Button label="Сохранить" :loading="loading" type="submit" class="p-button-success mr-1"></Button>
         </div>
      </form>
   </Dialog>
</template>

<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import { api } from '../../api';
import { loading, UpdateBeans } from '../../store';
import EditForm from '../edit-form/EditForm.vue';

let props = defineProps(['schema', 'table', 'id'])

let bean = ref(null)
let cols = ref([])
let showDialog = ref(false)

function openModalEdit() {
   Promise.all([api[props.schema][props.table].GetCols(), api[props.schema][props.table].GetBean(props.id)]).then(data => {
      cols.value = data[0] ?? []
      bean.value = data[1]
      showDialog.value = true
   })
}

function save(){
   console.log(bean.value);
   api[props.schema][props.table].SaveBean(bean.value).then(data => {
      showDialog.value = false
      bean.value = null
      UpdateBeans(props.schema, props.table, data)
   })
}
</script>