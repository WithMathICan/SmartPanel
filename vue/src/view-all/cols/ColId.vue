<template>
   <router-link :to="`/${col.table_schema}/${col.table_name}/edit/${bean.id}`">{{bean.id}}</router-link>
</template>

<script setup>
let props = defineProps(['bean', 'col'])
</script>