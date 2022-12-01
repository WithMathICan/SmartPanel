import {reactive} from 'vue'
import {api} from './api.js'

export const spTableKey = (schema, table) => `${schema}.${table}`
export const spColsData = reactive({})
export const spBeans = reactive({})

export async function FillColsData(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spColsData[key] && !refresh) return;
   spColsData[key] = await api[schema][table].GetColsData()
}

export async function FillBeans(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spBeans[key] && !refresh) return;
   spBeans[key] = await api[schema][table].GetBeans()
}

