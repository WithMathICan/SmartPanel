<template>
<form v-if="bean && Array.isArray(spColsData[key])" v-on:submit.prevent="submit">
   <Grid2>
      <InputField v-for="col in spColsData[key]" :key="col.column_name" :bean="bean" :col="col"></InputField>
   </Grid2>
   <input type="submit" value="Save">
</form>
</template>

<script setup>
import { computed } from 'vue';
import { spTableKey, spColsData } from '../../store';
import Grid2 from '../Grid2.vue'
import InputField from './InputField.vue'

let props = defineProps(['schema', 'table', 'bean'])

let key = computed(() => spTableKey(props.schema, props.table))

function submit(){
   
}

</script>