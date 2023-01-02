import { RouteRecordRaw } from 'vue-router'
import ViewAllRecords from './view-all/ViewAllRecords.vue'
import EditRecord from './edit/EditRecord.vue'
import CopyRecord from './edit/CopyRecord.vue'
import CreateRecord from './edit/CreateRecord.vue'

export function CreateRoutes(tables) {
   /**@type {RouteRecordRaw[]} */
   let routes = []
   for (let schema in tables) {
      for (let table of tables[schema]) {
         routes.push({
            name: `view_all_${schema}_${table}`,
            path: `/${schema}/${table}`,
            component: <ViewAllRecords table={table} schema={schema} />
         })
      }
   }
   routes.push({
      path: `/:schema/:table/edit/:id`,
      name: 'edit',
      component: EditRecord,
      props: true,
   })
   routes.push({
      path: `/:schema/:table/copy/:id`,
      name: 'copy',
      component: CopyRecord,
      props: true,
   })
   routes.push({
      path: `/:schema/:table/new`,
      name: 'new',
      component: CreateRecord,
      props: true,
   })
   routes.push({
      path: `/`,
      name: 'main',
      component: <h1>Главная страница</h1>
   })
   routes.push({
      path: '/:catchAll(.*)*',
      component: <h1>Страница не найдена</h1>,
   })
   console.log({routes});
   return routes
}