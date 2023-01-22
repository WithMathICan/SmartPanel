'use strict'

const spf = require('../app/sp-functions.js')

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   // 'X-Content-Type-Options': 'nosniff',
   // 'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   // 'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
   'Content-Type': 'application/json; charset=UTF-8',
};

/**
 * 
 * @param {string[]} DB_SCHEMAS 
 * @param {string} api_prefix 
 * @param {import('pg').Pool} pg_pool 
 * @returns {Promise<import('../definitions').FRouter>}
 */
async function createSpModelRouter(DB_SCHEMAS, api_prefix, pg_pool){
   let db_tables = await spf.spFindDbTables(DB_SCHEMAS, pg_pool)
   console.log({api_prefix});

   /** @type {import('../definitions').FRouter} */
   async function spRouter(method, url){
      if (url === api_prefix + '/init'){
         return {
            data : {result: db_tables},
            statusCode: 200,
            headers: HEADERS,
         }
      }
      return null;
   }

   return spRouter;
}

module.exports = {createSpModelRouter}