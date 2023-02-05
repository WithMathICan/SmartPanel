'use strict'

const {Pool} = require('pg');
const assert = require('node:assert')
const http = require('node:http');
const path = require('node:path');

const { config } = require('./config.js');
const { createStaticHandler, createIndexHtmlHandler } = require('./sp-routes/sp-static.js');
const { logger } = require('./app/sp-logger.js');
const { createSpApiRouter } = require('./sp-routes/sp-api.js');
const {createInterfaces} = require('./app/create-interfaces.js')

process.on('uncaughtException', err => {
   logger.log(err);
})

const pool = new Pool(config.DB_SETTINGS);

pool.query("SELECT 1+1").then(async () => {
   const public_root = path.resolve('./public')
   const staticHandler = createStaticHandler(public_root, logger)
   const indexHtmlHandler = createIndexHtmlHandler(public_root, config.SP_NAME)
   const apiRouter = await createSpApiRouter(config.DB_SETTINGS.database, config.DB_SCHEMAS, pool, '/api/' + config.SP_NAME)
   createInterfaces(config.DB_SCHEMAS, config.DB_SETTINGS.database, pool)

   logger.log({apiRouter});

   http.createServer(async (req, res) => {
      let url = req.url || '/'
      let method = req.method?.toUpperCase() || 'GET'
      let args = method === 'POST' ? await receiveArgs(req) : {}
      logger.log({method, url});

      /** @type {import('sp-routes/router.js').IServerResponse<any> | null} */
      let resData = null 
      if (method === 'GET'){
         resData = await staticHandler(url)
         if (!resData) resData = await indexHtmlHandler(url)
      }
      if (!resData) {
         let handler = apiRouter(method, url)
         if (handler) resData = await handler({...args})
      }

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
   logger.log("Server started on port", config.PORT);
}).catch(e =>{
   logger.error(e)
})

/**
 * @param {import('node:http').IncomingMessage} req 
 * @returns 
 */
async function receiveArgs(req) {
   try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString();
      if (!data) return {}
      let parsedData = JSON.parse(data);
      assert(typeof parsedData === 'object', "ParsedData shold be an object")
      return parsedData
   } catch (/** @type {any} */ e) {
      logger.error(e);
      return {}
   }
}
