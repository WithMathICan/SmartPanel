'use strict';

const assert = require('node:assert')
const pg = require('pg')

/**
 * 
 * @param {string} table 
 * @param {pg.PoolClient} pg_client 
 * @returns 
 */
module.exports = (table, pg_client) => ({
   query(sql, arr) {
      return pg_client.query(sql, arr)
   },

   async queryFirst(sql, arr = []) {
      let { rows } = await pg_client.query(sql, arr)
      return rows[0]
   },

   async queryAll(sql, arr = []) {
      let { rows } = await pg_client.query(sql, arr)
      return rows
   },

   findById(id, fields = ['*']) {
      return this.queryFirst(`select ${fields.join(',')} from ${table} where id=$1`, [id])
   },

   async read(id, fields = ['*']) {
      let sql = `SELECT ${fields.join(',')} from ${table}`
      if (!id) {
         let { rows } = await pg_client.query(sql)
         return rows
      }
      let { rows } = await pg_client.query(`${sql} WHERE id=$1`, [id])
      return rows[0]
   },

   async create({ ...record }) {
      let fields = []
      let nums = []
      let args = []
      let i = 1
      for (let key in record) {
         fields.push(key)
         nums.push(`$${i++}`)
         args.push(record[key])
      }
      let sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES (${nums.join(',')}) RETURNING *`
      let { rows } = await pg_client.query(sql, args)
      return rows[0]
   },

   async update(id, { ...record }) {
      if (!id) throw new Error("Id should specified")
      let delta = []
      let i = 1
      let args = []
      for (let key in record) {
         delta.push(`${key}=$${i++}`)
         args.push(record[key])
      }
      let sql = `UPDATE ${table} SET ${delta.join(',')} WHERE id=$${i} RETURNING *`
      args.push(id)
      let { rows } = await pg_client.query(sql, args)
      return rows[0]
   },

   // async remove(id) {
   //    let sql = `DELETE FROM ${table} WHERE id=$1 returning id`
   //    let { rows } = await pg_client.query(sql, [id])
   //    return rows[0]
   // },

   async removeMany(ids) {
      assert(Array.isArray(ids), 'Данные для удаления не корректны.')
      let nums = ids.map((v, i) => `$${i + 1}`);
      let sql = `DELETE FROM ${table} WHERE id in (${nums.join(',')}) returning id`
      let {rows} = await pg_client.query(sql, ids)
      return rows.map(el => el.id)
   }
})