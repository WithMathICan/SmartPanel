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


async function createApiRouter(DB_SCHEMAS){
   let db_tables = await spFindDbTables(DB_SCHEMAS)


   /**
    * @param {string} url 
    * @returns {import('./definitions').IRouterResult}
    */
   async function apiRouter(url){

   }

   return apiRouter
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