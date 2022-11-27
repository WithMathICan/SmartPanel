'use strict';

const http = require('http');
const { init } = require('./app/init');
const { DB_SCHEMAS, SERVER_PORT } = require('./config');
const { pool } = require('./pg_pool');

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
   console.log(db_tables);
   server(db_tables, SERVER_PORT)
})();

async function FindDbTables(schemas) {
   const db_tables = {};
   for (let schema of schemas) {
      let sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = $1"
      let { rows } = await pool.query(sql, [schema])
      if (rows.length > 0) db_tables[schema] = rows.map(el => el.table_name)
   }
   return db_tables
}

function server(db_tables, port) {
   http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8')
      res.setHeader('Access-Control-Allow-Origin', '*',)
      let { url, socket, method } = req
      console.log(url, method);

      if (url === '/api/init' && method === 'GET') {
         return res.end(JSON.stringify(db_tables))
      }

      res.statusCode = 404
      res.end("Not Found")
   }).listen(port, () => console.log("Api server started on port ", port))
}