'use strict'

const pg = require('pg')
const assert = require('node:assert');
const { spFindDbTables } = require('./sp-functions');
const {SpController} = require('./sp-controller')

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
   let sp_actions = CreateSpActions(api_prefix, db_tables, pg_pool)

   /**
    * @param {string} url 
    * @param {any} args
    * @returns {Promise<import('./definitions').IServerResponse>}
    */
   async function apiRouter(url, args){
      if (url === `${api_prefix}/init`) return createResponse(db_tables)

      let handler = sp_actions[url]
      if (handler){
         let {result, message, statusCode} = await handler(args)
         return createResponse({result, message}, statusCode)
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
 * @param {string} schema 
 * @param {string} table 
 * @param {pg.Pool} pg_pool 
 */
function findSpController(schema, table, pg_pool){
   return SpController(schema, table, pg_pool)
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
function CreateSpActions(api_prefix, db_tables, pg_pool) {
   /** @type {Record<string, CApiResult>} */
   let sp_actions = {}
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         let controller = findSpController(schema, table, pg_pool)
         for (let key in controller) if (typeof controller[key] === 'function') {
            sp_actions[`${api_prefix}/${schema}/${table}/${key.replace('_', '-')}`] = controller[key]
         }
      }
   }
   return sp_actions
}

module.exports = {createApiRouter}