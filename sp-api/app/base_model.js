'use strict';

const db = require('./db')
const { pool, queryAll } = require("./pg_pool");
const { spCreateCols } = require('./sp-functions');

/**
 * @param {string} schema 
 * @param {string} table 
 * @returns {import("common/definitions").ITableApi}
 */
const BaseModel = (schema, table) => ({
   async cols() {
      let result = spCreateCols(schema, table)
      if (result.length === 0) return {statusCode: 404, message: 'Данная таблица не существует'}
      return { statusCode: 200, result }
   },

   async bean(id, fields = ['*']) {
      let bean = await db(`${schema}.${table}`, pool).findById(id, fields)
      if (bean) return { statusCode: 200, result: bean }
      else return { statusCode: 404, message: "Элемент не найден" }
   },

   async beans(fields = ['*']) {
      let sql = `select ${fields.join(',')} from ${schema}.${table} order by id desc`
      return { statusCode: 200, result: await queryAll(sql) }
   },
})

module.exports = BaseModel