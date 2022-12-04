const { pool } = require("../pg_pool");


async function GetBeans(schema, table, fields=['*']){
   let {rows} = await pool.query(`select ${fields.join(',')} from ${schema}.${table} order by id desc`)
   return {statusCode: 200, result: rows}
}

module.exports = GetBeans