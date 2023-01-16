'use strict'

const {Pool} = require('pg');
const config = require('./config.js');
const assert = require('node:assert')
const http = require('node:http');
const path = require('node:path');
const { createStaticRouter, createIndexHtmlRouter } = require('./routes/staticRouter.js');

process.on('uncaughtException', err => {
   console.log(err);
})

const pool = new Pool(config.DB_SETTINGS);
pool.query("SELECT 1+1").then(async () => {
   let db_tables = await spFindDbTables(config.DB_SCHEMAS, pool);
   let public_root = path.resolve('./assets')
   let staticRoter = createStaticRouter(public_root)
   let indexHtmlRouter = createIndexHtmlRouter(public_root, config.SP_NAME)

   http.createServer(async (req, res) => {
      let {url, method} = req
      method = method.toUpperCase()
      let args = method === 'POST' ? await receiveArgs(req) : null
      console.log({method, url});

      let resData = await staticRoter(method, url)
      if (!resData) resData = await indexHtmlRouter(method, url)

      let resIsJson = req.headers['accept'] === 'application/json'
      if (resData){
         res.writeHead(resData.statusCode, resData.headers)
         if (resIsJson) res.end(JSON.stringify(resData.data))
         else res.end(resData.data)
      }
      else {
         res.statusCode = 404;
         if (resIsJson) res.end(JSON.stringify({message: `Page '${url}' NOT FOUND!`}))
         else res.end('404, Not Found');
      }
   }).listen(config.PORT)

   console.log('Server started on port ', config.PORT);
})


/**
 * @param {string[]} schemas 
 * @param {pg.PoolClient} pg_client
 * @returns {Promise<Record<string, string[]>>}
 */
async function spFindDbTables(schemas, pg_client) {
   const db_tables = {};
   for (let schema of schemas) {
      let sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = $1"
      let {rows} = await pg_client.query(sql, [schema])
      if (rows.length > 0) db_tables[schema] = rows.map(el => el.table_name)
   }
   return db_tables
}

async function receiveArgs(req) {
   try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString();
      if (!data) return {}
      let parsedData = JSON.parse(data);
      assert(typeof parsedData === 'object', "ParsedData shold be an object")
      return parsedData
   } catch (e) {
      console.error(e);
      return {}
   }
};
