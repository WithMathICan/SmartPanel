<template>
   <label :for="col.column_name">{{col.column_name}}<span class="text-red" v-if="!col.is_nullable">*</span></label>
   <Dropdown class="w-full" v-model="bean[col.column_name]" :required="!col.is_nullable"
      :options="showOptions" :optionLabel="fk.foreign_title_column_name" 
      :optionValue="fk.foreign_column_name" :filter="(showOptions.length>8)" />
</template>

<script setup>
import {Col} from 'sp-common'
import { FillBeans, spBeans, spTableKey } from '../../store';
import Dropdown from 'primevue/dropdown'
import { computed } from '@vue/reactivity';

/** @type {{bean: any, col: Col}} */
let props = defineProps(['bean', 'col']) 
let {fk} = props.col

FillBeans(fk.foreign_table_schema, fk.foreign_table_name)
let key = spTableKey(fk.foreign_table_schema, fk.foreign_table_name)
let showOptions = computed(() => {
   if (Array.isArray(spBeans[key])) return spBeans[key].sort((a, b) => {
      if (a[fk.foreign_title_column_name] > b[fk.foreign_title_column_name]) return 1
      return -1
   })
   return []
})
</script>