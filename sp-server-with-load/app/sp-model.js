'use strict'

const {createCRUD} = require("./crud.js")
const spf = require('./sp-functions.js')

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {import('pg').PoolClient} pg_client
 * @returns {import("sp-common/main").ITableApi}
 */
function createSpModel(schema, table, pg_client){
   let table_name = `${schema}.${table}`
   let crud = createCRUD(schema, table, pg_client)

   return {
      async cols(){
         let result = await spf.spCreateCols(schema, table, pg_client)
         if (result.length === 0) return { statusCode: 404, message: 'Данная таблица не существует' }
         result = result.filter(el => el.column_name !== 'id')
         return { statusCode: 200, result }
      },

      async bean({ id, fields = ['*'] }) {
         let bean = await crud.findById(id, fields)
         if (bean) return { statusCode: 200, result: bean }
         else return { statusCode: 404, message: "Элемент не найден" }
      },
   
      async beans({ fields = ['*'] }) {
         let sql = `select ${fields.join(',')} from ${table_name} order by id desc`
         return { statusCode: 200, result: await crud.queryAll(sql) }
      },
   
      async save({ bean }) {
         let id = bean.id
         delete bean.id
         let savedBean = id ? await crud.update(id, bean) : await crud.create(bean)
         if (savedBean) return { statusCode: id ? 200 : 201, result: savedBean, message: 'Успешно сохранено' }
         else return { statusCode: 404, message: "Ошибка при сохранении" }
      },
   
      async remove({ids}){
         let deletedIds = await crud.removeMany(ids)
         return {statusCode: 200, result: deletedIds}
      }
   }
}

module.exports = {createSpModel}