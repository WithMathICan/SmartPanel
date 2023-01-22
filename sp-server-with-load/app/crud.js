'use strict';

/**
 * @param {string} schema 
 * @param {string} table 
 * @param {import('pg').PoolClient} pg_client 
 */
function createCRUD(schema, table, pg_client) {
   let table_name = `${schema}.${table}`

   return {
      /**
       * @param {string} sql 
       * @param {any[]} arr 
       * @returns {Promise<import('pg').QueryResult>}
       */
      query(sql, arr) {
         return pg_client.query(sql, arr)
      },
   
      /**
       * 
       * @param {string} sql 
       * @param {any[]} arr 
       */
      async queryFirst(sql, arr = []) {
         let { rows } = await pg_client.query(sql, arr)
         return rows[0]
      },
   
      /**
       * 
       * @param {string} sql 
       * @param {any[]} arr 
       * @returns {Promise<any[]>}
       */
      async queryAll(sql, arr = []) {
         let { rows } = await pg_client.query(sql, arr)
         return rows
      },
   
      /**
       * 
       * @param {string} id 
       * @param {string[]} fields 
       */
      findById(id, fields = ['*']) {
         return this.queryFirst(`select ${fields.join(',')} from ${table_name} where id=$1`, [id])
      },
   
      /**
       * 
       * @param {string} id 
       * @param {string[]} fields 
       * @returns 
       */
      async read(id, fields = ['*']) {
         let sql = `SELECT ${fields.join(',')} from ${table_name}`
         // if (!id) {
         //    let { rows } = await pg_client.query(sql)
         //    return rows
         // }
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
         let sql = `INSERT INTO ${table_name} (${fields.join(',')}) VALUES (${nums.join(',')}) RETURNING *`
         let { rows } = await pg_client.query(sql, args)
         return rows[0]
      },
   
      /**
       * @param {string} id 
       */
      async update(id, { ...record }) {
         let delta = []
         let i = 1
         let args = []
         for (let key in record) {
            delta.push(`${key}=$${i++}`)
            args.push(record[key])
         }
         let sql = `UPDATE ${table_name} SET ${delta.join(',')} WHERE id=$${i} RETURNING *`
         args.push(id)
         let { rows } = await pg_client.query(sql, args)
         return rows[0]
      },
   
      /**
       * @param {string[]} ids 
       * @returns {Promise<string[]>} 
       */
      async removeMany(ids) {
         let nums = ids.map((v, i) => `$${i + 1}`);
         let sql = `DELETE FROM ${table_name} WHERE id in (${nums.join(',')}) returning id`
         let {rows} = await pg_client.query(sql, ids)
         return rows.map(el => el.id)
      }
   }
}

module.exports = {createCRUD}