const pg = require('pg')
const { SpModel } = require('./sp-model')

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {pg.Pool} pool
 * @returns {import("sp-common/main").ITableApi}
 */
function SpController(schema, table, pool) {
   // console.log({pool});
   let spModel = findSpModel(schema, table)
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

function findSpModel(schema, table){
   return SpModel
}

module.exports = {SpController, findSpModel}
