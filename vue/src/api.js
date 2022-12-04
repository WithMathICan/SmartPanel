import { showMessage } from "./messages";

export const api = {}

async function get(url) {
   try {
      let data = await fetch(url)
      if (!data.ok) {
         let { message } = await data.json()
         if (message) showMessage(message, 15000, 'error')
         else showMessage('Ошибка сервера', 15000, 'error')
      } else {
         let { result, message } = await data.json()
         if (message) showMessage(message, 5000, 'success')
         return result
      }
   } catch (e) {
      console.log(e);
   }
}

export function CreateApi(tables, API_PATH) {
   for (let schema in tables) {
      api[schema] = {}
      for (let table of tables[schema]) {
         api[schema][table] = {}
         api[schema][table].GetColsData = () => get(`${API_PATH}/${schema}/${table}/cols`)
         api[schema][table].GetBeans = () => get(`${API_PATH}/${schema}/${table}/beans`)
         api[schema][table].GetBean = (id) => get(`${API_PATH}/${schema}/${table}/bean/${id}`)
      }
   }
}