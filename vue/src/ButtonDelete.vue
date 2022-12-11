<template>
   <Button :label="label" :loading="loading" type="button" icon="pi pi-trash" iconPos="right"
      class="p-button-danger mr-1" @click="confirmDelete($event)" :disabled="ids && ids.length>0"></Button>
   <ConfirmPopup></ConfirmPopup>
</template>

<script setup>
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Button from 'primevue/button';
import { loading, RemoveBeans } from './store'
import { useRouter } from 'vue-router';

let props = defineProps(['schema', 'table', 'ids', 'label'])
let router = useRouter()

function GoToAll(){
   router.push({name: `view_all_${props.schema}_${props.table}`})
}

const confirm = useConfirm();
const confirmDelete = (event) => {
   confirm.require({
      target: event.currentTarget,
      message: 'Действительно хотите удалить?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'УДАЛИТЬ',
      acceptClass: 'p-button-danger',
      rejectLabel: 'Не удалять',
      accept: () => {
         RemoveBeans(props.schema, props.table, props.ids, GoToAll)
      },
      reject: () => { }
   });
}
</script>