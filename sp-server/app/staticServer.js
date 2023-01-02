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
   'Strict-Transport-Security': 'max-age=0; includeSubdomains; preload',
}

/**
 * 
 * @param {string} root 
 * @param {string} url 
 * @returns {import('./server').IServerResponse}
 */
async function staticServer(root, url) {
   try {
      const filePath = await findFilePath(root, url)
      const data = await fs.promises.readFile(filePath);
      const mimeType = findMimeType(filePath)
      return {
         headers: { ...HEADERS, 'Content-Type': mimeType },
         data,
         statusCode: 200,
      }
   } catch (err) {
      if (err.code !== 'ENOENT') console.error(err);
      return null
   }
}

/** 
 * @param {string} root
 * @param {string} url 
 */
async function findFilePath(root, url) {
   let filePath = path.join(root, url);
   console.log({ url, root });

   for (let i = 0; i < 10 && filePath.endsWith('/'); i++) filePath = filePath.slice(0, -1);
   if (filePath.endsWith('/')) throw new Error("Could not remove / from file path")

   let stat = await fs.promises.lstat(filePath);
   if (stat.isDirectory()) {
      filePath += '/index.html'
      stat = await fs.promises.lstat(filePath)
   }

   assert(stat.isFile(), "File not found")
   return filePath
}

/**
 * 
 * @param {string} filePath 
 * @returns {string}
 */
function findMimeType(filePath) {
   const fileExt = path.extname(filePath).substring(1);
   console.log({ fileExt });
   const mimeType = MIME_TYPES[fileExt] || MIME_TYPES.html;
   return mimeType
}

const indexHtml = sp_assets => async () => ({
   headers: { 'Content-Type': 'text/html; charset=UTF-8' },
   statusCode: 200,
   data: await fs.promises.readFile(path.join(sp_assets, 'index.html'))
})

module.exports = { staticServer, indexHtml }