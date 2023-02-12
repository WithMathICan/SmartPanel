'use strict'

/**
 * @type {import("./crud").FCreateCRUD}
 * @param {string} schema
 * @param {string} table
 * @param {import('pg').PoolClient} pgClient
 */
const createCRUD = (schema, table, pgClient) => ({
   tableName: `${schema}.${table}`,

   query(sql, arr = []) {
      return pgClient.query(sql, arr)
   },

   async queryAll(sql, arr = []) {
      const { rows } = await pgClient.query(sql, arr)
      return rows
   },

   async queryFirst(sql, arr = []) {
      const { rows } = await pgClient.query(sql, arr)
      return rows[0]
   },

   findById(id, fields) {
      return this.queryFirst(`select ${fields.join(',')} from ${this.tableName} where id=$1`, [id])
   },

   read(id, fields) {
      const sql = `SELECT ${fields.join(',')} from ${this.tableName}`
      return this.queryFirst(sql, [id])
   },

   create({ ...record }) {
      delete record.id
      const fields = []
      const nums = []
      const args = []
      let i = 1
      for (const key in record) {
         fields.push(key)
         nums.push(`$${i++}`)
         args.push(record[key])
      }
      const sql = `INSERT INTO ${this.tableName} (${fields.join(',')}) VALUES (${nums.join(',')}) RETURNING *`
      return this.queryFirst(sql, args)
   },

   update(id, { ...record }) {
      delete record.id
      const delta = []
      let i = 1
      const args = []
      for (const key in record) {
         delta.push(`${key}=$${i++}`)
         args.push(record[key])
      }
      const sql = `UPDATE ${this.tableName} SET ${delta.join(',')} WHERE id=$${i} RETURNING *`
      args.push(id)
      return this.queryFirst(sql, args)
   },

   async removeMany(ids) {
      const nums = ids.map((v, i) => `$${i + 1}`);
      const sql = `DELETE FROM ${this.tableName} WHERE id in (${nums.join(',')}) returning id`
      const { rows } = await pgClient.query(sql, ids)
      return rows.map(el => el.id)
   }
})

module.exports = { createCRUD }
