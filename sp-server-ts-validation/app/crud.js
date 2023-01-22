/** 
 * @type {import("./crud").FCreateCRUD} 
 * @param {string} schema 
 * @param {string} table 
 * @param {import('pg').PoolClient} pg_client 
 */
const createCRUD = (schema, table, pg_client) => ({
   table_name: `${schema}.${table}`,

   query(sql, arr = []) {
      return pg_client.query(sql, arr)
   },

   async queryAll(sql, arr = []) {
      let { rows } = await pg_client.query(sql, arr)
      return rows
   },

   async queryFirst(sql, arr = []) {
      let { rows } = await pg_client.query(sql, arr)
      return rows[0]
   },

   findById(id, fields) {
      return this.queryFirst(`select ${fields.join(',')} from ${this.table_name} where id=$1`, [id])
   },

   read(id, fields) {
      let sql = `SELECT ${fields.join(',')} from ${this.table_name}`
      return this.queryFirst(sql, [id])
   },

   create({ ...record }) {
      delete record.id
      let fields = []
      let nums = []
      let args = []
      let i = 1
      for (let key in record) {
         fields.push(key)
         nums.push(`$${i++}`)
         args.push(record[key])
      }
      let sql = `INSERT INTO ${this.table_name} (${fields.join(',')}) VALUES (${nums.join(',')}) RETURNING *`
      return this.queryFirst(sql, args)
   },

   update(id, { ...record }) {
      delete record.id
      let delta = []
      let i = 1
      let args = []
      for (let key in record) {
         delta.push(`${key}=$${i++}`)
         args.push(record[key])
      }
      let sql = `UPDATE ${this.table_name} SET ${delta.join(',')} WHERE id=$${i} RETURNING *`
      args.push(id)
      return this.queryFirst(sql, args)
   },

   async removeMany(ids) {
      let nums = ids.map((v, i) => `$${i + 1}`);
      let sql = `DELETE FROM ${this.table_name} WHERE id in (${nums.join(',')}) returning id`
      let { rows } = await pg_client.query(sql, ids)
      return rows.map(el => el.id)
   }
})



module.exports = { createCRUD }