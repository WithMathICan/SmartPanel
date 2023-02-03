import { ClearMessages, showMessage } from "./messages";
import { loading } from "./store";


/** @type {import("./api").TSpApi} */
export const api = {}

/**
 * 
 * @param {string} url 
 * @param {any} body 
 * @returns 
 */
const post = async (url, body = '') => {
   if (typeof body === 'object') body = JSON.stringify(body)
   if (typeof body !== 'string') return console.error("typeof body !== 'string'");
   loading.value = true

   try {
      let data = await fetch(url, { method: 'POST', body, headers: { 'Accept': 'application/json' }})
      if (!data.ok) {
         let { message } = await data.json()
         throw new Error(message ?? 'Ошибка сервера')
      } else {
         let { result, message } = await data.json()
         if (message) showMessage(message, 5000, 'success')
         // console.log(result);
         return result
      }
   } catch (/** @type {any} */ e) {
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
         api[schema][table] = {
            GetCols: () => post(`${API_PATH}/${schema}/${table}/cols`),
            GetBeans: () => post(`${API_PATH}/${schema}/${table}/beans`),
            GetBean: (id) => post(`${API_PATH}/${schema}/${table}/bean`, { id }),
            CreateBean: (bean) => post(`${API_PATH}/${schema}/${table}/create`, { bean }),
            UpdateBean: (bean) => post(`${API_PATH}/${schema}/${table}/update`, { bean }),
            RemoveBeans: (ids) => post(`${API_PATH}/${schema}/${table}/remove`, { ids }),
         }
      }
   }
}