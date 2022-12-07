'use strict';

const db = require('./db')
const { pool, queryAll } = require("./pg_pool");
const { spCreateCols, spTableName } = require('./sp-functions');

/**
 * @param {string} schema 
 * @param {string} table 
 * @returns {import("common/definitions").ITableApi}
 */
const BaseModel = (schema, table) => ({
   async cols() {
      let result = await spCreateCols(schema, table)
      result = result.filter(el => el.column_name !== 'id')
      if (result.length === 0) return { statusCode: 404, message: 'Данная таблица не существует' }
      return { statusCode: 200, result }
   },

   async bean({ id, fields = ['*'] }) {
      let bean = await db(spTableName(schema, table), pool).findById(id, fields)
      if (bean) return { statusCode: 200, result: bean }
      else return { statusCode: 404, message: "Элемент не найден" }
   },

   async beans({ fields = ['*'] }) {
      let sql = `select ${fields.join(',')} from ${schema}.${table} order by id desc`
      return { statusCode: 200, result: await queryAll(sql) }
   },

   async save({ bean }) {
      let id = bean.id
      delete bean.id
      let savedBean = id
         ? await db(spTableName(schema, table), pool).update(id, bean)
         : await db(spTableName(schema, table), pool).create(bean)
      if (savedBean) return { statusCode: 200, result: savedBean, message: 'Успешно сохранено' }
      else return { statusCode: 404, message: "Ошибка при сохранении" }
   }
})

module.exports = BaseModel