<template>
   <Button :label="label" :loading="loading" type="button" icon="pi pi-trash" iconPos="right"
      class="p-button-danger" @click="confirmDelete($event)" :disabled="!(ids && ids.length>0)"></Button>
   <ConfirmPopup></ConfirmPopup>
</template>

<script setup>
import ConfirmPopup from 'primevue/confirmpopup';
import { useConfirm } from "primevue/useconfirm";
import Button from 'primevue/button';
import { loading, RemoveBeans } from '../../store'

let props = defineProps(['schema', 'table', 'ids', 'label', 'deleteCb'])


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
         RemoveBeans(props.schema, props.table, props.ids, props.deleteCb)
      },
      reject: () => { }
   });
}
</script>