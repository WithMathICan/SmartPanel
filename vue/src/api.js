import { ClearMessages, showMessage } from "./messages";
import { loading } from "./store";


/** @type {import("./api").TSpApi} */
export const api = {}

const post = async (url, body = '') => {
   if (typeof body === 'object') body = JSON.stringify(body)
   if (typeof body !== 'string') return console.error("typeof body !== 'string'");
   loading.value = true

   try {
      let data = await fetch(url, { method: 'POST', body })
      if (!data.ok) {
         let { message } = await data.json()
         throw new Error(message ?? 'Ошибка сервера')
      } else {
         let { result, message } = await data.json()
         if (message) showMessage(message, 5000, 'success')
         return result
      }
   } catch (e) {
      // console.log(e);
      showMessage(e.message, 15000, 'error')
   } finally{
      loading.value = false
   }
}

/**
 * 
 * @param {Record<string, string[]>} tables 
 * @param {string} API_PATH 
 */
export function CreateApi(tables, API_PATH) {
   for (let schema in tables) {
      api[schema] = {}
      for (let table of tables[schema]) {
         api[schema][table] = {}
         api[schema][table].GetColsData = () => post(`${API_PATH}/${schema}/${table}/cols-data`)
         api[schema][table].GetColsCreate = () => post(`${API_PATH}/${schema}/${table}/cols-create`)
         api[schema][table].GetColsEdit = () => post(`${API_PATH}/${schema}/${table}/cols-edit`)
         api[schema][table].GetColsCopy = () => post(`${API_PATH}/${schema}/${table}/cols-copy`)
         api[schema][table].GetBeans = () => post(`${API_PATH}/${schema}/${table}/beans`)
         api[schema][table].GetBean = (id) => post(`${API_PATH}/${schema}/${table}/bean`, { id })
         api[schema][table].SaveBean = (bean) => post(`${API_PATH}/${schema}/${table}/save`, { bean })
         api[schema][table].RemoveBeans = (ids) => post(`${API_PATH}/${schema}/${table}/remove`, { ids })
      }
   }
}