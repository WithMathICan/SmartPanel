'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');

const MIME_TYPES = {
   html: 'text/html; charset=UTF-8',
   json: 'application/json; charset=UTF-8',
   js: 'application/javascript; charset=UTF-8',
   css: 'text/css',
   png: 'image/png',
   ico: 'image/x-icon',
   svg: 'image/svg+xml',
};

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   'X-Content-Type-Options': 'nosniff',
   'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = (root, port, sp_path) => {
   http.createServer(async (req, res) => {
      if (req.method.toLowerCase() === 'get' && req.url.startsWith(sp_path)){
         let filePath = path.join(path.resolve(root), sp_path, 'index.html')
         const data = await fs.promises.readFile(filePath);
         console.log({filePath});
         res.writeHead(200, { ...HEADERS, 'Content-Type': MIME_TYPES.html });
         res.end(data);
         return
      }
      try {
         const filePath = await findFilePath(path.resolve(root), req.url)
         const data = await fs.promises.readFile(filePath);
         const fileExt = path.extname(filePath).substring(1);
         console.log({fileExt});
         const mimeType = MIME_TYPES[fileExt] || MIME_TYPES.html;
         res.writeHead(200, { ...HEADERS, 'Content-Type': mimeType });
         res.end(data);
      } catch (err) {
         console.error(err);
         res.statusCode = 404;
         res.end('"File is not found"');
      }
   }).listen(port);

   console.log(`Static on port `, port);
};

/** 
 * @param {string} root
 * @param {string} url 
 */
async function findFilePath(root, url) {
   let filePath = path.join(root, url);
   console.log({ url, root });

   for(let i = 0; i < 10 && filePath.endsWith('/'); i++) filePath = filePath.slice(0, -1);
   if (filePath.endsWith('/')) throw new Error("Could not remove / from file path")

   let stat = await fs.promises.lstat(filePath);
   if (stat.isDirectory()) {
      filePath += '/index.html'
      stat = await fs.promises.lstat(filePath)
   }

   assert(stat.isFile(), "File not found")
   return filePath
}


