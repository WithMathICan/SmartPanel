<template>
   <router-link :to="`/${col.schema_name}/${col.table_name}/${bean.id}`">{{bean.id}}</router-link>
</template>

<script setup>
let props = defineProps(['bean', 'col'])
</script>