const http = require('node:http');
const path = require('node:path');

const { spFileServer, spIndexHtml } = require('./app/staticServer.js');
const config = require('./app/config.js');

process.on('uncaughtException', err => {
   console.log(err);
})

http.createServer(async (req, res) => {
   let resData = null
   let {url} = req
   if (req.method.toUpperCase() === 'GET'){
      let root = path.resolve('assets')
      resData = await spFileServer(root, url)
      if(!resData) resData = await spIndexHtml(root, config.SP_NAME, url)
   }
   else if (req.method.toUpperCase() === 'POST'){

   }
   
   
   console.log({url, resData});
   if (resData){
      res.writeHead(resData.statusCode, resData.headers)
      res.end(resData.data)
   }
   else {
      res.statusCode = 404;
      res.end('404, Not Found');
   }
}).listen(config.PORT)

console.log('Server started on port ', config.PORT);