const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert')

const { spFileRouter, spIndexHtml } = require('./app/staticRoter.js');
const config = require('./config.js');
const { createApiRouter } = require('./app/apiRouter.js');
const {pool} = require('./app/pg_pool')

process.on('uncaughtException', err => {
   console.error(err);
});

const receiveArgs = async (req) => {
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

(async () => {
   // console.log({config});
   let spApiRouter = await createApiRouter(config.DB_SCHEMAS, `/api/${config.SP_NAME}`, pool)

   http.createServer(async (req, res) => {
      /** @type {import('./app/definitions.js').IServerResponse} */
      let resData = null
      let {url} = req
      while (url.length > 0 && url.endsWith('/')) url = url.substring(0, url.length - 1);

      if (req.method.toUpperCase() === 'GET'){
         let root = path.resolve('assets')
         resData = await spFileRouter(root, url)
         if(!resData) resData = await spIndexHtml(root, config.SP_NAME, url)
      }
      else if (req.method.toUpperCase() === 'POST'){
         let args = await receiveArgs(req)
         resData = await spApiRouter(url, args)
      }
      
      
      console.info({url, code: resData?.statusCode});
      if (resData){
         res.writeHead(resData.statusCode, resData.headers)
         res.end(resData.data)
      }
      else {
         res.statusCode = 404;
         if (req.headers['accept'] === 'application/json') res.end(JSON.stringify({message: `Page '${url}' NOT FOUND!`}))
         else res.end('404, Not Found');
      }
   }).listen(config.PORT)

   console.log('Server started on port ', config.PORT);
})()