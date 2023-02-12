({
   /**
    * @type {import('./sp-controller').FCreateSpController}
    * @param {string} schema
    * @param {string} table
    * @param {import('pg').Pool} pool
    */
   createSpController: (schema, table, pool) => {
      const tableName = `${schema}.${table}`;
      const fModel = sp.models[tableName]
      if (!fModel) throw new Error('Model not found')
      const model = fModel(pool)

      /** @type {import('./sp-controller').ITableApi} */
      const api = {
         async cols() {
            const result = await model.cols()
            if (result.length === 0) return { statusCode: 404, message: 'Table not found', result }
            else return { statusCode: 200, message: 'OK', result }
         },

         async bean({ id, fields = ['*'] }) {
            const result = await model.bean(id, fields)
            if (result) return { statusCode: 200, message: 'OK', result }
            else return { statusCode: 404, message: 'Bean not found', result }
         },

         async beans({ fields = ['*'] }) {
            const result = await model.beans(fields)
            return { statusCode: 200, message: 'OK', result }
         },

         async create(record) {
            console.log(record);
            const result = await model.create(record)
            if (result) return { statusCode: 201, message: 'OK', result }
            else return { statusCode: 400, message: 'Can not create new record', result }
         },

         async update(record) {
            const result = await model.update(record)
            if (result) return { statusCode: 200, message: 'OK', result }
            else return { statusCode: 400, message: 'Can not update record', result }
         },

         async removeMany({ ids }) {
            const result = await model.removeMany(ids)
            if (ids.length > 0) return { statusCode: 200, message: 'OK', result }
            else return { statusCode: 404, message: 'Can not delete records', result }
         }
      }

      return api
   }
})
