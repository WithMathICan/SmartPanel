'use strict'

const {Pool} = require('pg');
const config = require('./config.js');
const assert = require('node:assert')
const http = require('node:http');
const path = require('node:path');
const { createStaticRouter, createIndexHtmlRouter } = require('./routes/staticRouter.js');
const { createSpModelRouter } = require('./routes/spModelRouter.js');

process.on('uncaughtException', err => {
   console.log(err);
})

const pool = new Pool(config.DB_SETTINGS);
pool.query("SELECT 1+1").then(async () => {
   let public_root = path.resolve('./assets')
   let staticRoter = createStaticRouter(public_root)
   let indexHtmlRouter = createIndexHtmlRouter(public_root, config.SP_NAME)

   let spModelRouter = await createSpModelRouter(config.DB_SCHEMAS, `/api/${config.SP_NAME}`, pool)

   http.createServer(async (req, res) => {
      let url = req.url || '/'
      let method = req.method?.toUpperCase() || 'GET'
      method = method.toUpperCase()
      let args = method === 'POST' ? await receiveArgs(req) : null
      console.log({method, url});

      let resData = await staticRoter(method, url)
      if (!resData) resData = await indexHtmlRouter(method, url)
      if (!resData) {
         resData = await spModelRouter(method, url)
      }

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

   console.log('Server started on port ', config.PORT);
})

/**
 * 
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
};
