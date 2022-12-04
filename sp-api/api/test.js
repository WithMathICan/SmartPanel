const { TableModel } = require("../classes/table-model");
const { DB_SETTINGS } = require("../config");
const { pool } = require("../pg_pool");


module.exports.test = async function(){
   console.log('TEST');
   let model = new TableModel(DB_SETTINGS.database, 'public', 'country', pool)
   await model.CreateCols()
}