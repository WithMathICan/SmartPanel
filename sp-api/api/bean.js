const db = require('../db')
const { pool } = require("../pg_pool")

/**
 * 
 * @param {string} schema 
 * @param {string} table 
 * @param {string} id 
 * @returns {{statusCode: number, message?: string, result?: any}}
 */
async function GetBean(schema, table, id){
   let bean = await db(`${schema}.${table}`, pool).findById(id)
   if (bean) return {statusCode: 200, result: bean}
   else return {statusCode: 404, message: "Элемент не найден"}
}

module.exports = GetBean