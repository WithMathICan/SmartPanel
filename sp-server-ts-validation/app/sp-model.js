/* eslint-disable strict */
({
   /**
    * @type {import("./sp-model").FCreateSpModel}
    * @param {string} schema
    * @param {string} table
    */
   createSpModel: (schema, table) => {
      /**
       * @type {import("./sp-model").FSpModel}
       * @param {import('pg').PoolClient} pgClient
       */
      function model(pgClient) {
         const crud = sp.createCRUD(schema, table, pgClient)
         /** @type {import("./sp-model").ISpModel} */
         const SpModel = {
            async cols() {
               let result = await sp.func.spCreateCols(schema, table, sp.PG_DATABASE, pgClient)
               result = result.filter(el => el.column_name !== 'id')
               return result
            },

            create: bean => crud.create(bean),
            update: bean => crud.update(bean.id, bean),
            bean: (id, fields = ['*']) => crud.findById(id, fields),
            beans: (fields = ['*']) => crud.queryAll(`select ${fields.join(',')} from ${crud.tableName} order by id desc`),
            removeMany: (ids) => crud.removeMany(ids)
         }
         return SpModel
      }
      return model
   }
})
