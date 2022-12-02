import {reactive} from 'vue'
import {api} from './api.js'

export const spTableKey = (schema, table) => `${schema}.${table}`
export const spColsData = reactive({})
export const spBeans = reactive({})

export async function FillColsData(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spColsData[key] && !refresh) return;
   if (spColsData[key] === 'loading') return
   spColsData[key] = 'loading'
   spColsData[key] = await api[schema][table].GetColsData()
}

export async function FillBeans(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spBeans[key] && !refresh) return;
   if (spBeans[key] === 'loading') return
   spBeans[key] = 'loading'
   let beans = await api[schema][table].GetBeans()
   // for (let b of beans) for (let key in b) if (typeof b[key] === 'string' && b[key].endsWith('Z')){
   //    let new_date = Date.parse(b[key])
   //    if (new_date) b[key] = new Date(new_date)
   // }
   spBeans[key] = beans
}

