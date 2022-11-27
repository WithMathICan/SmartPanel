import {ref} from 'vue'

export const menu_items = ref([])

export function CreateMenuItems(tables){
   menu_items.value = Object.keys(tables).map(schema => ({
      label: schema, 
      items: tables[schema].map(table => ({label: table, to: `/${schema}/${table}`}))
   }))
}
