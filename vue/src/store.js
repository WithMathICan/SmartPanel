import {reactive, ref} from 'vue'
import {api} from './api.js'
import { showMessage } from './messages.js'

/**
 * @param {string} schema 
 * @param {string} table 
 * @returns {string}
 */
export const spTableKey = (schema, table) => `${schema}.${table}`

/** @type {{[x:string]: import('./api.js').Col[]}} */
export const spColsData = reactive({})

/** @type {{[x:string]: import('./api.js').DbRecord[] | string}} */
export const spBeans = reactive({})

/** @type {import('vue').Ref<boolean>} */
export const loading = ref(false)

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {*} spCols 
 * @param {*} getMethod 
 * @param {boolean} refresh 
 * @returns 
 */
async function FillCols(schema, table, spCols, getMethod, refresh){
   let key = spTableKey(schema, table)
   if (spCols[key] && !refresh) return;
   if (spCols[key] === 'loading') return;
   spCols[key] = 'loading'
   spCols[key] = await getMethod()
}

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {boolean} refresh 
 * @returns 
 */
export function FillColsData(schema, table, refresh = false){
   return FillCols(schema, table, spColsData, api[schema][table].GetCols, refresh)
}

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {boolean} refresh 
 * @returns 
 */
export async function FillBeans(schema, table, refresh = false){
   let key = spTableKey(schema, table)
   if (spBeans[key] && !refresh) return;
   if (spBeans[key] === 'loading') return;
   spBeans[key] = 'loading'
   spBeans[key] = await api[schema][table].GetBeans()
}

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {import('./api.js').DbRecord} bean 
 * @returns 
 */
export function UpdateBeans(schema, table, bean){
   let key = spTableKey(schema, table)
   if (!bean || !bean.id || !Array.isArray(spBeans[key])) return
   let oldBean = spBeans[key].find(el => el.id === bean.id)
   if (oldBean){
      for (let bkey in oldBean) if (bkey in bean) oldBean[bkey] = bean[bkey]
   }
   else {
      spBeans[key] = [bean, ...spBeans[key]]
   }
}

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {string[]} ids 
 * @param {Function} callback
 */
export function RemoveBeans(schema, table, ids, callback = () => {}){
   let key = spTableKey(schema, table)
   api[schema][table].RemoveBeans(ids).then(deletedIds => {
      if (!Array.isArray(deletedIds)) return showMessage('Ошибка при удалении', 5000, 'error')
      if (Array.isArray(spBeans[key])) spBeans[key] = spBeans[key].filter(el => !deletedIds.includes(el.id))
      callback(deletedIds)
   })
}

