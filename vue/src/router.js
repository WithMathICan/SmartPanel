import ViewAllRecords from './view-all/ViewAllRecords.vue'

export function CreateRoutes(tables){
   let routes = []
   for (let schema in tables){
      for (let table of tables[schema]){
         routes.push({ path: `/${schema}/${table}`, component: <ViewAllRecords table={table} schema={schema} />})
      }
   }
   return routes
}