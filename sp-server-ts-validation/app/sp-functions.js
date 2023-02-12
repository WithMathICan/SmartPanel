'use strict'

const { Col } = require('../classes/Col');
const { Fk } = require('../classes/Fk');


const MY_SQL_COLS = `SELECT * from information_schema.columns 
where table_catalog = $1 and table_schema = $2 and table_name = $3`;

// const MY_SQL_FK_SAME_SCHEMA = `SELECT
// tc.table_schema,
// tc.constraint_name,
// tc.table_name,
// kcu.column_name,
// ccu.table_schema AS foreign_table_schema,
// ccu.table_name AS foreign_table_name,
// ccu.column_name AS foreign_column_name
// FROM
// information_schema.table_constraints AS tc
// JOIN information_schema.key_column_usage AS kcu
// ON tc.constraint_name = kcu.constraint_name
// AND tc.table_schema = kcu.table_schema
// JOIN information_schema.constraint_column_usage AS ccu
// ON ccu.constraint_name = tc.constraint_name
// AND ccu.table_schema = tc.table_schema
// WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=$1 AND tc.table_name=$2`

const MY_SQL_FK = `SELECT
tc.table_schema, 
tc.constraint_name, 
tc.table_name, 
kcu.column_name, 
ccu.table_schema AS foreign_table_schema,
ccu.table_name AS foreign_table_name,
ccu.column_name AS foreign_column_name 
FROM 
information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=$1 AND tc.table_name=$2`

'use strict'

/**
* @param {string} schema
* @param {string} table
* @param {string} database
* @param {import('pg').PoolClient} pgClient
* @returns {Promise<Col[]>}
*/
async function spCreateCols(schema, table, database, pgClient) {
   const dbCols = await pgClient.query(MY_SQL_COLS, [database, schema, table])
   const cols = dbCols.rows.map(el => new Col(el))
   const dbFkData = await pgClient.query(MY_SQL_FK, [schema, table])
   /** @type {import('classes/Fk').IFk[]} */ const dbFk = dbFkData.rows

   for (const fk of dbFk) {
      const col = cols.find(el => el.column_name === fk.column_name)
      if (col) {
         // eslint-disable-next-line camelcase
         col.data_type = 'fk'
         col.fk = new Fk(fk, 'title')
      }
   }

   return cols
}

/**
* @param {string[]} schemas
* @param {import('pg').Pool} pgClient
* @returns {Promise<Record<string, string[]>>}
*/
async function spFindDbTables(schemas, pgClient) {
   /** @type {Record<string, string[]>} */
   const dbTables = {};
   for (const schema of schemas) {
      const sql = 'SELECT table_name FROM information_schema.tables WHERE table_schema = $1'
      const { rows } = await pgClient.query(sql, [schema])
      if (rows.length > 0) dbTables[schema] = rows.map(el => el.table_name)
   }
   return dbTables
}

/** @param {string} str */
function spSlugify(str) {
   return cyrilicToTranslit(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
}

const cyrilicMap = new Map(Object.entries({
   'а': 'a',
   'б': 'b',
   'в': 'v',
   'д': 'd',
   'з': 'z',
   'й': 'y',
   'к': 'k',
   'л': 'l',
   'м': 'm',
   'н': 'n',
   'о': 'o',
   'п': 'p',
   'р': 'r',
   'с': 's',
   'т': 't',
   'у': 'u',
   'ф': 'f',
   'ь': '',
   'г': 'g',
   'и': 'i',
   'ъ': '',
   'ы': 'i',
   'э': 'e',
   'ґ': 'g',
   'е': 'e',
   'і': 'i',
   '\'': '',
   '’': '',
   'ʼ': '',
   'ё': 'yo',
   'ж': 'zh',
   'х': 'kh',
   'ц': 'ts',
   'ч': 'ch',
   'ш': 'sh',
   'щ': 'shch',
   'ю': 'yu',
   'я': 'ya',
}))

/** @param {string} str */
function cyrilicToTranslit(str) {
   let newStr = ''
   for (let i = 0; i < str.length; i++) {
      const symbol =  cyrilicMap.get(str[i].toLowerCase())
      if (symbol) newStr += symbol
      else newStr += str[i]
   }
   return newStr
}

module.exports = { spCreateCols, spFindDbTables, spSlugify }
