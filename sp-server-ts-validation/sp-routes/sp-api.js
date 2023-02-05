'use strict'

const fs = require('node:fs')
const { createCRUD } = require('../app/crud.js')
const func = require('../app/sp-functions.js')
const load = require('../app/load.js')
const modelSrc = fs.readFileSync('app/sp-model.js', { encoding: 'utf8' })
const controllerSrc = fs.readFileSync('app/sp-controller.js', { encoding: 'utf-8' })
const { logger } = require('../app/sp-logger.js')
const path = require('node:path')
let console = logger

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   // 'X-Content-Type-Options': 'nosniff',
   // 'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   // 'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
   'Content-Type': 'application/json; charset=UTF-8',
};

/** @param {string} PG_DATABASE */
function readSpModel(PG_DATABASE) {
   let sandbox = Object.freeze({ console: logger, sp: { createCRUD, func, PG_DATABASE } })
   let { createSpModel } = load(modelSrc, sandbox)
   return createSpModel
}

/** @param {Record<string, import("app/sp-model").FSpModel>} models*/
function readSpController(models) {
   let sandbox = Object.freeze({ console: logger, sp: { func, models } })
   let { createSpController } = load(controllerSrc, sandbox)
   return createSpController
}

/**
 * @param {string} PG_DATABASE
 * @param {Record<string, string[]>} db_tables 
 * @returns {Record<string, import("app/sp-model").FSpModel>}
 */
function createApiModels(PG_DATABASE, db_tables) {
   /** @type {Record<string, import("app/sp-model").FSpModel>} */
   let models = {}
   let createSpModel = readSpModel(PG_DATABASE)
   let sandbox = Object.freeze({ console: logger, sp: { func, createSpModel } })
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         let key = `${schema}.${table}`
         let src = `sp.createSpModel('${schema}', '${table}');`
         let fileSrc = path.resolve(`sp-models/${schema}/${table}.js`)
         if (fs.existsSync(fileSrc)){
            src = fs.readFileSync(fileSrc, {encoding: 'utf-8'})
         }
         let res = load(src, sandbox)
         console.log({schema, table, res});
         models[key] = load(src, sandbox)
      }
   }
   return models
}

/**
 * @param {string} PG_DATABASE
 * @param {Record<string, string[]>} db_tables 
 * @param {import('pg').Pool} pool 
 * @returns {Record<string, import("app/sp-controller").ITableApi>}
 */
function createApiControllers(PG_DATABASE, db_tables, pool) {
   /** @type {Record<string, import("app/sp-controller").ITableApi>} */
   let controllers = {}
   let models = createApiModels(PG_DATABASE, db_tables)
   let createSpController = readSpController(models)

   let sandbox = Object.freeze({ createSpController, console: logger, pool, sp: { func } })
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         let key = `${schema}.${table}`
         controllers[key] = load(`createSpController('${schema}', '${table}', pool);`, sandbox)
      }
   }
   return controllers
}

/** @param {string} str */
const camelToUrlCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * @param {string} PG_DATABASE 
 * @param {string[]} DB_SCHEMAS 
 * @param {import('pg').Pool} pool 
 * @param {string} api_prefix 
 * @returns {Promise<import('./router.js').FRouter>}
 */
async function createSpApiRouter(PG_DATABASE, DB_SCHEMAS, pool, api_prefix) {
   const db_tables = await func.spFindDbTables(DB_SCHEMAS, pool)
   const controllers = createApiControllers(PG_DATABASE, db_tables, pool)
   /** @type {Record<string, import('app/sp-controller').FTableApi<any>>} */
   const handlers = {}
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         const controller = controllers[`${schema}.${table}`]
         for (let key in controller) {
            handlers[`${api_prefix}/${schema}/${table}/${camelToUrlCase(key)}`] = controller[key]
         }
      }
   }
   handlers[`${api_prefix}/init`] = async (args) => ({
      result: db_tables,
      statusCode: 200,
      message: 'OK'
   })

   /**
    * @type {import('./router.js').FRouter}
    * @param {string} method
    * @param {string} url
    * @returns {import('./router.js').FUrlHandler | null}
    */
   function router(method, url) {
      let apiHandler = handlers[url]
      if (method !== 'POST' || !apiHandler) return null

      /**
       * @type {import('./router.js').FUrlHandler}
       * @param {any} args 
       * @returns {Promise<import('./router.js').IServerResponse<{message: string, result: any}>>}
       */
      async function handler(args) {
         try{
            let { message, result, statusCode } = await apiHandler(args)
            return {
               data: { message, result },
               statusCode,
               headers: HEADERS,
            }
         }
         catch(/** @type {any} */ e){
            console.error(e)
            let message = e?.message ?? 'Server error'
            return {
               data: {message, result: null},
               statusCode: 404,
               headers: HEADERS,
            }
         }
      }

      return handler
   }

   return router
}

module.exports = { createSpApiRouter }
