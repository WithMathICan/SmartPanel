'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs')
const { DB_SCHEMAS, SERVER_PORT, DB_SETTINGS, API_FOLDER } = require('./config');
const { pool } = require('./app/pg_pool');

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   'X-Content-Type-Options': 'nosniff',
   'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
   'Content-Type': 'application/json; charset=UTF-8',
};

(async () => {
   let db_tables = await FindDbTables(DB_SCHEMAS)
   let actions = await FindAllActions(API_FOLDER)
   console.log(db_tables);
   server(db_tables, actions, SERVER_PORT, API_FOLDER)
})();

async function FindAllActions(folder) {
   try {
      let actions = {}
      for (let dir_name of await fs.promises.readdir(folder)) {
         let stat = await fs.promises.stat(path.resolve(folder, dir_name))
         if (!stat.isDirectory()) continue
         let dir_files = await fs.promises.readdir(path.resolve(folder, dir_name))
         // console.log({dir_files});
         if (dir_files.length === 0) continue
         actions[dir_name] = {}
         for (let file of await fs.promises.readdir(path.resolve(folder, dir_name))) {
            if (file.endsWith('.js')) {
               let obj = require(path.resolve(folder, dir_name, file))
               if (typeof obj !== 'object') continue
               let actionName = path.basename(file, '.js')
               actions[dir_name][actionName] = {}

               for (let key in obj) {
                  if (typeof obj[key] === 'function') actions[dir_name][actionName][key] = obj[key]
               }
            }
         }
      }

      // for (let file of files) if (file.endsWith('.js')){
      //    let actionName = path.basename(file, '.js')
      //    let func = require(path.join(API_FOLDER, file))
      //    console.log({actionName}, typeof func);
      //    if (typeof func === 'function') actions[actionName] = func
      // }
      console.dir({ actions }, {depth: 200});
      return actions
   }
   catch (e) {
      console.log(e);
   }
}

async function FindDbTables(schemas) {
   const db_tables = {};
   for (let schema of schemas) {
      let sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = $1"
      let { rows } = await pool.query(sql, [schema])
      if (rows.length > 0) db_tables[schema] = rows.map(el => el.table_name)
   }
   return db_tables
}

function server(db_tables, actions, port) {
   http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8')
      res.setHeader('Access-Control-Allow-Origin', '*',)
      res.statusCode = 404
      let { url, socket, method } = req
      console.log(socket.remoteAddress, method, url);

      if (url === '/api/init' && method === 'GET') {
         res.statusCode = 200
         return res.end(JSON.stringify(db_tables))
      }

      let params = url.substring(1).split('/')
      if (params.length >= 4 && params[0] === 'api') {
         console.log(params);
         let schema = params[1]
         let table = params[2]
         let action = params[3]
         let id = params[4]
         console.log({ schema, table, action, id });
         let schemaTables = db_tables[schema]
         if (!schemaTables || !schemaTables.includes(table)) return res.end("Not Found")
         let handler = actions[action]
         console.log(typeof handler);
         if (!handler) return res.end("Not Found")
         let { statusCode, result, message } = await handler(schema, table, id)
         res.statusCode = statusCode
         return res.end(JSON.stringify({ message, result }))
      }

      res.end("Not Found")
   }).listen(port, () => console.log("Api server started on port ", port))
}

