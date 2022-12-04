<template>
   <router-link :to="linkTo">{{bean.id}}</router-link>
</template>

<script setup>
import { computed } from 'vue';

let props = defineProps(['bean', 'col'])
let linkTo = computed(() => ({ name: 'edit', params: { 
   schema: props.col.table_schema, 
   table: props.col.table_name, 
   id: props.bean.id }})
)
</script>