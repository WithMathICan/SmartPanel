const { TableModel } = require("../classes/table-model")
const { pool } = require("../pg_pool")

async function GetCols(schema, table){
   let model = new TableModel(schema, table, pool)
   await model.CreateCols()
   return {statusCode: 200, result: model.cols}
}

module.exports = GetCols