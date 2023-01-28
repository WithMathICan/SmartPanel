'use strict'

/**
 * @type {import("./sp-model").FCreateSpModel}
 * @param {string} schema 
 * @param {string} table 
 * @param {import("./crud").FCreateCRUD} createCrud 
 */
function createSpModel(schema, table, createCrud) {

   /**
    * @type {import("./sp-model").FSpModel}
    * @param {import('pg').PoolClient} pg_client 
    */
   function model(pg_client){
      let crud = createCrud(schema, table, pg_client)

      /** @type {import("./sp-model").ISpModel} */
      let SpModel = {
         async cols(){
            let result = await sp.func.spCreateCols(schema, table, sp.PG_DATABASE, pg_client)
            result = result.filter(el => el.column_name !== 'id')
            return result
         },

         create: bean => crud.create(bean),
         update: bean => crud.update(bean.id, bean),
         bean: (id, fields = ['*']) => crud.findById(id, fields),
         beans: (fields = ['*']) => crud.queryAll(`select ${fields.join(',')} from ${crud.table_name} order by id desc`),
         removeMany: (ids) => crud.removeMany(ids)
      }

      return SpModel
   }

   return model

}

module.exports = {createSpModel}