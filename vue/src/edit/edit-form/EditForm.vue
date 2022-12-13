<template>
   <Grid2>
      <InputField v-for="col in cols" :key="col.column_name" :bean="bean" :col="col"></InputField>
   </Grid2>
</template>

<script setup>
import { spTableKey, spColsData } from '../../store';
import Grid2 from '../components/Grid2.vue'
import InputField from './InputField.vue'


let props = defineProps(['cols', 'bean'])

let tkey = spTableKey(props.schema, props.table)



</script>