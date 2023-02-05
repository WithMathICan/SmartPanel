const {spCreateCols, spFindDbTables} = require('./sp-functions.js')
const fs = require('node:fs')
const path = require('node:path')

/** 
 * @param {string[]} db_schemas
 * @param {string} database
 * @param {import('pg').Pool} pg_client
 */
async function createInterfaces(db_schemas, database, pg_client){
    /**
     * @param {string} schema 
     * @param {string} table 
     * @returns {Promise<string>}
     */
    async function createInterfaceByCols(schema, table){
        /** @type {import('classes/Col').Col[]} */
        let cols = await spCreateCols(schema, table, database, pg_client)
        let str = `export interface I${schema}_${table}{\n`
        for (let col of cols){
            let data_type = col.data_type === 'date'
                ? 'Date'
                : col.data_type === 'number'
                    ? 'number'
                    : col.data_type === 'id'
                        ? 'number'
                        : 'string'
            str += `   ${col.column_name}: ${data_type}`
            str += '\n'
        }
        str += '}'
        return str
    }

    /** @type {Record<string, string[]>} */
    let db_tables = await spFindDbTables(db_schemas, pg_client)
    for (let schema in db_tables){
        for (let table of db_tables[schema]){
            let dir = path.resolve(`sp-interfaces/${schema}`)
            if (!fs.existsSync(dir)) await fs.promises.mkdir(dir)
            await fs.promises.writeFile(path.join(dir, `${table}.ts`), await createInterfaceByCols(schema, table))
        }
    }
}



module.exports = {createInterfaces}
