<template>
   <router-link :to="`/${schema}/${table}/${bean.id}`">{{bean.id}}</router-link>
</template>

<script setup>
let props = defineProps(['schema', 'table', 'bean'])
</script>