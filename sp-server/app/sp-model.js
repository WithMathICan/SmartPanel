'use strict'

const db = require("./db.js")
const spf = require('./sp-functions.js')
const pg = require('pg')

// class SpModel{
//    constructor(schema, table, pg_client){
//       this.schema = schema
//       this.table = table
//       this.pg_client = pg_client
//       this.table_name = `${schema}.${table}`
//       this.crud = db(this.table_name, pg_client)
//    }

//    async cols_data() {
//       let result = await spf.spCreateCols(this.schema, this.table, this.pg_client)
//       result = result.filter(el => el.column_name !== 'id')
//       if (result.length === 0) return { statusCode: 404, message: 'Данная таблица не существует' }
//       return { statusCode: 200, result }
//    }
// }

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {pg.PoolClient} pg_client
 * @returns {import("sp-common/main").ITableApi}
 */
function SpModel(schema, table, pg_client){
   let table_name = `${schema}.${table}`
   let crud = db(table_name, pg_client)

   return {
      async cols(){
         let result = await spf.spCreateCols(schema, table, pg_client)
         if (result.length === 0) return { statusCode: 404, message: 'Данная таблица не существует' }
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

module.exports = {SpModel}