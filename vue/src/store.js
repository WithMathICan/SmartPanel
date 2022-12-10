import {reactive} from 'vue'
import {api} from './api.js'

export const spTableKey = (schema, table) => `${schema}.${table}`
export const spColsData = reactive({})
export const spBeans = reactive({})

export async function FillColsData(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spColsData[key] && !refresh) return;
   if (spColsData[key] === 'loading') return;
   spColsData[key] = 'loading'
   spColsData[key] = await api[schema][table].GetColsData()
}

export async function FillBeans(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spBeans[key] && !refresh) return;
   if (spBeans[key] === 'loading') return;
   spBeans[key] = 'loading'
   spBeans[key] = await api[schema][table].GetBeans()
}

export function UpdateBeans(schema, table, bean){
   let key = spTableKey(schema, table)
   if (!bean.id || !Array.isArray(spBeans[key])) return
   let oldBean = spBeans[key].find(el => el.id === bean.id)
   if (oldBean){
      for (let bkey in oldBean) if (bkey in bean) oldBean[bkey] = bean[bkey]
   }
   else {
      spBeans[key] = {bean, ...spBeans[key]}
   }
}

