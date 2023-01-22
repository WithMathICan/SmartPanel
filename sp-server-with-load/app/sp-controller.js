
/**
 * @param {string} schema 
 * @param {string} table 
 * @param {import('pg').Pool} pool
 * @returns {import("sp-common/main").ITableApi}
 */
function SpController(schema, table, pool) {
   let table_name = `${schema}.${table}`;
   let spModel = sp.models[table_name];

   return {
      async cols() {
         let pg_client= await pool.connect()
         let model = spModel(schema, table, pg_client)
         
         let data = await model.cols()
         pg_client.release()
         return data
      },

      async bean({id, fields = ['*']}){
         let model = spModel(schema, table, pool)
         let data = await model.bean({id, fields})
         return data
      },

      async beans({fields = ['*']}){
         let model = spModel(schema, table, pool)
         let data = await model.beans({fields})
         return data
      },

      async save({ bean }) {
         let model = spModel(schema, table, pool)
         let data = await model.save({bean})
         return data
      },

      async remove({ids}){
         let model = spModel(schema, table, pool)
         let data = await model.remove({ids})
         return data
      }
   }
}

module.exports = {SpController}
