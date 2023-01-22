'use strict'

const spf = require('../app/sp-functions.js')
const load = require('../app/load.js')
const {createSpModel} = require('../app/sp-model')

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
 * @param {import('../definitions').ApiHandler} func 
 * @param {any} args 
 * @returns {Promise<import('../definitions').IServerResponse>}
 */
async function WrapResponse(func, args){
   let {statusCode, message, result} = await func(args)
   return {data: {message: message ?? '', result}, statusCode, headers: HEADERS}
}

/**
 * @param {string[]} DB_SCHEMAS 
 * @param {string} api_prefix 
 * @param {import('pg').Pool} pg_pool 
 * @returns {Promise<import('../definitions').ApiRouter>}
 */
async function createSpModelRouter(DB_SCHEMAS, api_prefix, pg_pool){
   let db_tables = await spf.spFindDbTables(DB_SCHEMAS, pg_pool)

   /** @type {import('../definitions').ApiHandler} */
   let Init = async (_args) => ({result: db_tables, statusCode: 200})

   let models = findModels(db_tables);

   /** @type {import('../definitions').ApiRouter} */
   async function spRouter(method, url){
      if (method !== 'POST') return null;
      if (url === api_prefix + '/init') return args => WrapResponse(Init, args)
      return null;
   }

   return spRouter;
}

/**
 * @param {Record<string, string[]>} db_tables 
 * @returns {Record<string, import('sp-common/main').IApiResult<any>>}
 */
function findModels(db_tables){
   /** @type {Record<string, import('sp-common/main').IApiResult<any>>}} */
   let models = {}
   let modelSanbox = Object.freeze({createSpModel})

   for (let schema in db_tables){
      for (let table of db_tables[schema]){
         models[`${schema}.${table}`] = load(`createSpModel('${schema}', '${table}')`, modelSanbox)
      }
   }
   return models;
}



module.exports = {createSpModelRouter}