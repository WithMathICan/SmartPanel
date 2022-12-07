<template>
   <Grid2 v-if="bean && Array.isArray(spColsData[key])">
      <InputField v-for="col in spColsData[key]" :key="col.column_name" :bean="bean" :col="col"></InputField>
   </Grid2>
</template>

<script setup>
import { computed } from 'vue';
import { spTableKey, spColsData } from '../../store';
import Grid2 from '../Grid2.vue'
import InputField from './InputField.vue'


let props = defineProps(['schema', 'table', 'bean'])

let key = spTableKey(props.schema, props.table)



</script>