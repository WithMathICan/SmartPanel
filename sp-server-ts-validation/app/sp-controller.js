'use strict'

/**
 * @type {import('./sp-controller').FCreateSpController}
 * @param {string} schema 
 * @param {string} table 
 * @param {import('pg').Pool} pool 
 */
function createSpController(schema, table, pool) {
   let table_name = `${schema}.${table}`;
   let fModel = sp.models[table_name]
   if (!fModel) throw new Error('Model not found')
   let model = fModel(pool)

   /** @type {import('./sp-controller').ITableApi} */
   let api = {
      async cols(){
         let result = await model.cols()
         if (result.length === 0) return {statusCode: 404, message: 'Table not found', result}
         else return {statusCode: 200, message: 'OK', result}
      },

      async bean(id, fields = ['*']){
         let result = await model.bean(id, fields)
         if (result) return {statusCode: 200, message: 'OK', result}
         else return {statusCode: 404, message: 'Bean not found', result}
      },

      async beans(fields = ['*']){
         let result = await model.beans(fields)
         return {statusCode: 200, message: 'OK', result}
      },

      async create(record){
         let result = await model.create(record)
         if (result) return {statusCode: 201, message: 'OK', result}
         else return {statusCode: 400, message: 'Can not create new record', result}
      },

      async update(record){
         let result = await model.update(record)
         if (result) return {statusCode: 200, message: 'OK', result}
         else return {statusCode: 400, message: 'Can not update record', result}
      },

      async removeMany(ids){
         let result = await model.removeMany(ids)
         if (ids.length > 0) return {statusCode: 200, message: 'OK', result}
         else return {statusCode: 404, message: "Can not delete records", result}
      }
   }

   return api
}