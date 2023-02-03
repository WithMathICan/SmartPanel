import {ref} from 'vue'

/** @type {import('vue').Ref<import('primevue/menuitem').MenuItem[]>} */
export const menu_items = ref([])

/** @param {Record<string, string[]>} tables */
export function CreateMenuItems(tables){
   menu_items.value = Object.keys(tables).map(schema => ({
      label: schema, 
      items: tables[schema].map(table => ({label: table, to: `/${schema}/${table}`}))
   }))
}
