'use strict'

const { spCreateCols, spFindDbTables } = require('./sp-functions.js')
const fs = require('node:fs')
const path = require('node:path')

/**
 * @param {string[]} dbSchemas
 * @param {string} database
 * @param {import('pg').Pool} pgClient
 */
async function createInterfaces(dbSchemas, database, pgClient) {
   /**
    * @param {string} schema
    * @param {string} table
    * @returns {Promise<string>}
    */
   async function createInterfaceByCols(schema, table) {
      /** @type {import('classes/Col').Col[]} */
      const cols = await spCreateCols(schema, table, database, pgClient)
      let str = `export interface I${schema}_${table}{\n`
      for (const col of cols) {
         const dataType = col.data_type === 'date' ? 'Date' :
            col.data_type === 'number' ? 'number' :
               col.data_type === 'id' ? 'number' : 'string'
         str += `   ${col.column_name}: ${dataType}`
         str += '\n'
      }
      str += '}'
      return str
   }

   /** @type {Record<string, string[]>} */
   const dbTables = await spFindDbTables(dbSchemas, pgClient)
   for (const schema in dbTables) {
      for (const table of dbTables[schema]) {
         const dir = path.resolve(`sp-interfaces/${schema}`)
         if (!fs.existsSync(dir)) await fs.promises.mkdir(dir)
         await fs.promises.writeFile(path.join(dir, `${table}.ts`), await createInterfaceByCols(schema, table))
      }
   }
}



module.exports = { createInterfaces }
