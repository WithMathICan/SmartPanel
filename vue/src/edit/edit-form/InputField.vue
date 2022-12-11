<template>
<div v-if="col.data_type === 'varchar'">
   <label :for="col.column_name">{{col.column_name}}<span class="text-red" v-if="!col.is_nullable">*</span></label>
   <InputText class="w-full" :required="!col.is_nullable" :id="col.column_name" type="text" v-model="bean[col.column_name]"/>
</div>
<div v-else-if="col.data_type === 'number'">
   <label :for="col.column_name">{{col.column_name}}<span class="text-red" v-if="!col.is_nullable">*</span></label>
   <InputNumber class="w-full" :required="!col.is_nullable" :id="col.column_name" v-model.number="bean[col.column_name]" />
</div>
<div v-else-if="col.data_type === 'date'">
   <label :for="col.column_name">{{col.column_name}}<span class="text-red" v-if="!col.is_nullable">*</span></label>
   <Calendar class="w-full" :required="!col.is_nullable" v-model="bean[col.column_name]" :showTime="true" />
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
   let date = Date.parse(props.bean[props.col.column_name])
   props.bean[props.col.column_name] = date ? new Date(date) : new Date()
}


</script>