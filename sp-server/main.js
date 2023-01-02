const http = require('node:http');
const path = require('node:path');

const { staticServer } = require('./app/staticServer.js');
const config = require('./config.js');
const createRoutes = require('./routes.js')

process.on('uncaughtException', err => {
   console.log(err.message);
})

http.createServer(async (req, res) => {
   let routes = createRoutes(config.SMART_PANEL_PATH, path.resolve('assets') + config.SMART_PANEL_PATH)
   let resData = await (async () => {
      let data = await staticServer(path.resolve('assets'), req.url)
      if (data) return data

      for (let r of routes){

      }


   })()
   
   console.log({resData});
   if (resData){
      res.writeHead(resData.statusCode, resData.headers)
      res.end(resData.data)
   }
   else {
      res.statusCode = 404;
      res.end('404, Not Found');
   }
}).listen(config.SERVER_PORT)

console.log('Server started on port ', config.SERVER_PORT);