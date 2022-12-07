<template>
<form v-if="bean && Array.isArray(spColsData[key])" v-on:submit.prevent="submit">
   <Grid2>
      <label v-for="col in spColsData[key]" :key="col.column_name">{{col.column_name}}
         <input type="text" v-model="bean[col.column_name]">
      </label>
   </Grid2>
   <input type="submit" value="Save">
</form>
</template>

<script setup>
import { computed } from 'vue';
import { spTableKey, spColsData } from '../../store';
import Grid2 from '../Grid2.vue'

let props = defineProps(['schema', 'table', 'bean'])
let key = computed(() => spTableKey(props.schema, props.table))

function submit(){
   
}

</script>