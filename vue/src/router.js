import {RouteRecordRaw} from 'vue-router'
import ViewAllRecords from './view-all/ViewAllRecords.vue'
import EditRecord from './edit/EditRecord.vue'
import NotFound from './NotFound.vue'

export function CreateRoutes(tables){
   /**@type {RouteRecordRaw[]} */
   let routes = []
   for (let schema in tables){
      for (let table of tables[schema]){
         routes.push({ 
            path: `/${schema}/${table}`, 
            component: <ViewAllRecords table={table} schema={schema} />
         })
      }
      routes.push({
         path: `/:schema/:table/:id`,
         name: 'edit',
         component: EditRecord,
         props: true,
      })
      routes.push({
         path: '/:catchAll(.*)*',
         component: NotFound,
      })
   }
   return routes
}