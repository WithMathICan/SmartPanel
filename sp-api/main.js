'use strict';

const { DB_SCHEMAS, SERVER_PORT, API_FOLDER, SMART_PANEL_API_PREFIX } = require('./config');
const { pool } = require('./app/pg_pool');
const server = require('./http.js');

(async () => {
   let db_tables = await FindDbTables(DB_SCHEMAS)
   let sp_actions = CreateSmartPanelActions(db_tables)
   console.log(db_tables);
   server(sp_actions, SERVER_PORT)
})();

/**
 * @param {string[]} schemas 
 * @returns {Record<string, string[]>}
 */
 async function FindDbTables(schemas) {
   const db_tables = {};
   for (let schema of schemas) {
      let sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = $1"
      let { rows } = await pool.query(sql, [schema])
      if (rows.length > 0) db_tables[schema] = rows.map(el => el.table_name)
   }
   return db_tables
}

/** @param {Record<string, string[]>} db_tables  */
function CreateSmartPanelActions(db_tables) {
   let sp_actions = {}
   let BaseModel = require('./app/base_model')
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         let obj = BaseModel(schema, table)
         for (let key in obj) if (typeof obj[key] === 'function') {
            sp_actions[`${SMART_PANEL_API_PREFIX}/${schema}/${table}/${key.replace('_', '-')}`] = obj[key]
         }
      }
   }
   sp_actions[`${SMART_PANEL_API_PREFIX}/init`] = async () => ({statusCode: 200, result: db_tables})
   return sp_actions
}


// async function FindAllActions(folder) {
//    try {
//       let actions = {}
//       for (let dir_name of await fs.promises.readdir(folder)) {
//          let stat = await fs.promises.stat(path.resolve(folder, dir_name))
//          if (!stat.isDirectory()) continue
//          let dir_files = await fs.promises.readdir(path.resolve(folder, dir_name))
//          // console.log({dir_files});
//          if (dir_files.length === 0) continue
//          actions[dir_name] = {}
//          for (let file of await fs.promises.readdir(path.resolve(folder, dir_name))) {
//             if (file.endsWith('.js')) {
//                let obj = require(path.resolve(folder, dir_name, file))
//                if (typeof obj !== 'object') continue
//                let actionName = path.basename(file, '.js')
//                actions[dir_name][actionName] = {}

//                for (let key in obj) {
//                   if (typeof obj[key] === 'function') actions[dir_name][actionName][key] = obj[key]
//                }
//             }
//          }
//       }

//       // for (let file of files) if (file.endsWith('.js')){
//       //    let actionName = path.basename(file, '.js')
//       //    let func = require(path.join(API_FOLDER, file))
//       //    console.log({actionName}, typeof func);
//       //    if (typeof func === 'function') actions[actionName] = func
//       // }
//       console.dir({ actions }, {depth: 200});
//       return actions
//    }
//    catch (e) {
//       console.log(e);
//    }
// }



