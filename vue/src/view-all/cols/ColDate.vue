<template>
   <span>{{showDate(data)}}</span>
</template>

<script setup>
let props = defineProps({data: Date})

/** @param {Date} data */
function showDate(date){
   return new Intl.DateTimeFormat("ru", { dateStyle: 'short', timeStyle: 'short' }).format(date)
}
</script>