<template>
   <Grid2 v-if="bean && Array.isArray(spColsData[tkey])">
      <InputField v-for="col in spColsData[tkey]" :key="col.column_name" :bean="bean" :col="col"></InputField>
   </Grid2>
</template>

<script setup>
import { spTableKey, spColsData } from '../../store';
import Grid2 from '../Grid2.vue'
import InputField from './InputField.vue'


let props = defineProps(['schema', 'table', 'bean'])

let tkey = spTableKey(props.schema, props.table)



</script>