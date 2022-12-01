export const api = {}

export function CreateApi(tables, API_PATH){
   for (let schema in tables) {
      api[schema] = {}
      for (let table of tables[schema]) {
         api[schema][table] = {}
         api[schema][table].GetColsData = async () => {
            try {
               let data = await fetch(`${API_PATH}/${schema}/${table}/cols`)
               if (!data.ok) return
               return data.json()
            } catch (e) {
               console.log(e);
            }
         }
         api[schema][table].GetBeans = async () => {
            try {
               let data = await fetch(`${API_PATH}/${schema}/${table}/beans`)
               if (!data.ok) return
               return data.json()
            } catch (e) {
               console.log(e);
            }
         }
      }
   }
}