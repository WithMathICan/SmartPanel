'use strict'

const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');

/** @type {Record<string, string>} */
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
 * @param {string} root
 * @param {string} url
 */
async function findFilePath(root, url) {
   let filePath = path.join(root, url);

   for (let i = 0; i < 10 && filePath.endsWith('/'); i++) filePath = filePath.slice(0, -1);
   if (filePath.endsWith('/')) throw new Error('Could not remove / from file path')

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
 * @returns 
 */
function findMimeType(filePath) {
   const fileExt = path.extname(filePath).substring(1);
   const mimeType = MIME_TYPES[fileExt] ?? MIME_TYPES.html;
   return mimeType
}

/** 
 * @param {any} func
 * @returns {import('../definitions').FRouter} */
function ErrorWrapper(func) {
   /** @type {import('../definitions').FRouter} */
   async function router(method, url) {
      try {
         if (method.toUpperCase() !== 'GET') {
            return null;
         }
         return await func(url)
      } catch (err) {
         if (err && typeof err === 'object' && 'code' in err){
            if (err['code'] !== 'ENOENT') console.error(err);
         }
         return null
      }
   }
   return router
}

/** @param {string} publicRoot */
function createStaticRouter(publicRoot) {
   return ErrorWrapper(
      /** @param {string} url */
      async function (url) {
         const filePath = await findFilePath(publicRoot, url)
         const data = await fs.promises.readFile(filePath);
         const mimeType = findMimeType(filePath)
         return {
            headers: { ...HEADERS, 'Content-Type': mimeType },
            data,
            statusCode: 200,
         }
      }
   )
}

/**
 * @param {string} public_root 
 * @param {string} sp_name
 */
function createIndexHtmlRouter(public_root, sp_name) {
   return ErrorWrapper(
      /** @param {string} url */
      async function IndexHtml(url) {
         if (url.startsWith('/' + sp_name)) {
            let filePath = path.join(public_root, sp_name, 'index.html');
            let data = await fs.promises.readFile(filePath)
            return {
               headers: { 'Content-Type': 'text/html; charset=UTF-8' },
               statusCode: 200,
               data,
            }
         }
         return null
      }
   )
}

module.exports = {
   createStaticRouter, createIndexHtmlRouter,
}
