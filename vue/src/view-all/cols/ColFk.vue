<template>
   {{ data }}
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import { spBeans, FillBeans,  spTableKey } from '../../store'
import { Col } from '../../api'
import { computed } from '@vue/reactivity';

export default defineComponent({
   props: ['col', 'bean'],

   /** @param {{col: Col, bean: any}} props */
   setup(props) {
      function init() {
         FillBeans(props.col.fk.foreign_table_schema, props.col.fk.foreign_table_name)
      }
      onMounted(init)
      let data = computed(() => {
         return findData()
      })
      function findData() {
         let { fk } = props.col
         let id = props.bean[props.col.column_name]
         let tableKey = spTableKey(fk.foreign_table_schema, fk.foreign_table_name)
         if (!Array.isArray(spBeans[tableKey])) return props.bean[props.col.column_name]
         let fkBean = spBeans[tableKey].find(el => el[fk.foreign_column_name] === id)
         if (fkBean) return fkBean[fk.foreign_title_column_name]
         return props.bean[props.col.column_name]
      }

      return { data }
   }
})
</script>