'use strict'

const {Pool} = require('pg');
const assert = require('node:assert')
const http = require('node:http');
const path = require('node:path');
const { config } = require('./config.js');
const { createStaticHandler, createIndexHtmlHandler } = require('./sp-routes/sp-static.js');

process.on('uncaughtException', err => {
   console.log(err);
})

const pool = new Pool(config.DB_SETTINGS);

pool.query("SELECT 1+1").then(async () => {
   let public_root = path.resolve('./public')
   let staticHandler = createStaticHandler(public_root)
   let indexHtmlHandler = createIndexHtmlHandler(public_root, config.SP_NAME)

   http.createServer(async (req, res) => {
      let url = req.url || '/'
      let method = req.method?.toUpperCase() || 'GET'
      let args = method === 'POST' ? await receiveArgs(req) : {}
      console.log({method, url});

      /** @type {import('sp-routes/router.js').IServerResponse<any> | null} */
      let resData = null 
      if (method === 'GET'){
         resData = await staticHandler(url)
         if (!resData) resData = await indexHtmlHandler(url)
      }
      // if (!resData) {
      //    let handler = await spModelRouter(method, url)
      //    if (handler) resData = await handler({...args})
      // }

      let resIsJson = req.headers['accept'] === 'application/json'
      // console.log({resIsJson});
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
   console.log("Server started on port ", config.PORT);
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
   } catch (e) {
      console.error(e);
      return {}
   }
}
