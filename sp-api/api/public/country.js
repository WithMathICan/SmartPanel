'use strict'

const { TableModel } = require("../../app/table-model")
const db = require('../../app/db')
const { pool } = require("../../app/pg_pool")

/** @type {import("common/definitions").ITableApi} */
let ResObject = {
   async cols(schema, table){
      let model = new TableModel(schema, table, pool)
      await model.CreateCols()
      return {statusCode: 200, result: model.cols}
   },

   async bean(schema, table, id, fields=['*']){
      let bean = await db(`${schema}.${table}`, pool).findById(id, fields)
      if (bean) return {statusCode: 200, result: bean}
      else return {statusCode: 404, message: "Элемент не найден"}
   },

   async beans(schema, table, fields){
      let {rows} = await pool.query(`select ${fields.join(',')} from ${schema}.${table} order by id desc`)
      return {statusCode: 200, result: rows}
   }
}

module.exports = ResObject