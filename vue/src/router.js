import Home from './Home'

export function CreateRoutes(tables){
   let routes = []
   for (let key in tables){
      for (let table of tables[key]){
         routes.push({ path: `/${key}/${table}`, component: <Home title={table} />})
      }
      return routes
   }
}