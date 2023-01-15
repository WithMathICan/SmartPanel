'use strict'


const assert = require('node:assert');
const { spFindDbTables } = require('./sp-functions');

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   // 'X-Content-Type-Options': 'nosniff',
   // 'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   // 'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
   'Content-Type': 'application/json; charset=UTF-8',
};




async function createApiRouter(DB_SCHEMAS, api_prefix, pg_pool){
   let db_tables = await spFindDbTables(DB_SCHEMAS, pg_pool)


   /**
    * @param {string} url 
    * @returns {Promise<import('./definitions').IRouterResult>}
    */
   async function apiRouter1(url){
      if (url === `${api_prefix}/init`) return { handler: async () => ({ statusCode: 200, data: JSON.stringify(db_tables), headers }) }
      
      return null
   }

   /**
    * @param {string} url 
    * @param {any} args
    * @returns {Promise<import('./definitions').IServerResponse>}
    */
   async function apiRouter(url, args){
      if (url === `${api_prefix}/init`){
         return createResponse(db_tables)
      }
   }

   return apiRouter
}

/**
 * 
 * @param {any} result 
 * @param {number} statusCode 
 * @param {Record<string, string>} headers 
 * @returns {import('./definitions').IServerResponse}
 */
function createResponse(result, statusCode = 200, headers = HEADERS){
   return {data: JSON.stringify({result}), statusCode, headers}
}



/**
 * @callback CApiResult
 * @param {any} args
 * @returns {Promise<import('sp-common/main').IApiResult>}
 */

/** 
 * @param {string} api_prefix  
 * @param {Record<string, string[]>} db_tables  
 * @returns {Record<string, CApiResult>}
 */
function CreateSmartPanelActions(api_prefix, db_tables) {
   /** @type {Record<string, CApiResult>} */
   let sp_actions = {}
   let BaseModel = require('./app/base_model')
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         let obj = BaseModel(schema, table)
         for (let key in obj) if (typeof obj[key] === 'function') {
            sp_actions[`${api_prefix}/${schema}/${table}/${key.replace('_', '-')}`] = obj[key]
         }
      }
   }
   sp_actions[`${api_prefix}/init`] = async () => ({ statusCode: 200, result: db_tables })
   return sp_actions
}


module.exports = {createApiRouter}