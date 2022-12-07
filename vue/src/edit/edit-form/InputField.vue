<template>
<div v-if="col.data_type === 'varchar'">
   <label :for="col.column_name">{{col.column_name}}</label>
   <InputText class="w-full" :id="col.column_name" type="text" v-model="bean[col.column_name]"/>
</div>
<div v-else-if="col.data_type === 'number'">
   <label :for="col.column_name">{{col.column_name}}</label>
   <InputNumber class="w-full" :id="col.column_name" v-model="bean[col.column_name]" />
</div>
<div v-else-if="col.data_type === 'date'">
   <label :for="col.column_name">{{col.column_name}}</label>
   <Calendar class="w-full" v-model="bean[col.column_name]" :showTime="true" />
</div>
<div v-else-if="col.data_type === 'fk'">
   <InputFk :bean="bean" :col="col"></InputFk>
</div>

</template>

<script setup>
import {Col} from 'common/col'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar';
import InputFk from './InputFk.vue'

/** @type {{bean: any, col: Col}} */
let props = defineProps(['bean', 'col']) 

if (props.col.data_type === 'date') {
   props.bean[props.col.column_name] = new Date(props.bean[props.col.column_name])
}


</script>