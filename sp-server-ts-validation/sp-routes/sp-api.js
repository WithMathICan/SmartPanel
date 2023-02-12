'use strict'

const fs = require('node:fs');
const { createCRUD } = require('../app/crud.js')
const func = require('../app/sp-functions.js')
const load = require('../app/load.js')
const modelSrc = fs.readFileSync('sp-models/sp-model.js', { encoding: 'utf8' })
const controllerSrc = fs.readFileSync('sp-models/sp-controller.js', { encoding: 'utf-8' })
const { logger } = require('../app/sp-logger.js');
const path = require('node:path');
const console = logger

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
   const sandbox = Object.freeze({ console: logger, sp: { createCRUD, func, PG_DATABASE } })
   const { createSpModel } = load(modelSrc, sandbox)
   return createSpModel
}

/** @param {Record<string, import("sp-models/sp-model").FSpModel>} models*/
function readSpController(models) {
   const sandbox = Object.freeze({ console: logger, sp: { func, models } })
   const { createSpController } = load(controllerSrc, sandbox)
   return createSpController
}

/**
 * @param {string} PG_DATABASE
 * @param {Record<string, string[]>} dbTables
 * @returns {Record<string, import("sp-models/sp-model").FSpModel>}
 */
function createApiModels(PG_DATABASE, dbTables) {
   /** @type {Record<string, import("sp-models/sp-model").FSpModel>} */
   const models = {}
   const createSpModel = readSpModel(PG_DATABASE)
   const sandbox = Object.freeze({ console: logger, sp: { func, createSpModel } })
   for (const schema in dbTables) {
      for (const table of dbTables[schema]) {
         const key = `${schema}.${table}`
         let src = `sp.createSpModel('${schema}', '${table}');`
         const fileSrc = path.resolve(`sp-models/${schema}/${table}.js`)
         if (fs.existsSync(fileSrc)) {
            src = fs.readFileSync(fileSrc, { encoding: 'utf-8' })
         }
         const res = load(src, sandbox)
         console.log({ schema, table, res })
         models[key] = load(src, sandbox)
      }
   }
   return models
}

/**
 * @param {string} PG_DATABASE
 * @param {Record<string, string[]>} dbTables
 * @param {import('pg').Pool} pool
 * @returns {Record<string, import("sp-models/sp-controller").ITableApi>}
 */
function createApiControllers(PG_DATABASE, dbTables, pool) {
   /** @type {Record<string, import("sp-models/sp-controller").ITableApi>} */
   const controllers = {}
   const models = createApiModels(PG_DATABASE, dbTables)
   const createSpController = readSpController(models)

   const sandbox = Object.freeze({ createSpController, console: logger, pool, sp: { func } })
   for (const schema in dbTables) {
      for (const table of dbTables[schema]) {
         const key = `${schema}.${table}`
         controllers[key] = load(`createSpController('${schema}', '${table}', pool);`, sandbox)
      }
   }
   return controllers
}

/** @param {string} str */
const camelToUrlCase = (str) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * @param {string} PG_DATABASE
 * @param {string[]} DB_SCHEMAS
 * @param {import('pg').Pool} pool
 * @param {string} apiPrefix
 * @returns {Promise<import('./router.js').FRouter>}
 */
async function createSpApiRouter(PG_DATABASE, DB_SCHEMAS, pool, apiPrefix) {
   const dbTables = await func.spFindDbTables(DB_SCHEMAS, pool)
   const controllers = createApiControllers(PG_DATABASE, dbTables, pool)
   /** @type {Record<string, import('sp-models/sp-controller').FTableApi<any>>} */
   const handlers = {}
   for (const schema in dbTables) {
      for (const table of dbTables[schema]) {
         const controller = controllers[`${schema}.${table}`]
         for (const key in controller) {
            // @ts-ignore
            handlers[`${apiPrefix}/${schema}/${table}/${camelToUrlCase(key)}`] = controller[key]
         }
      }
   }
   handlers[`${apiPrefix}/init`] = async () => ({
      result: dbTables,
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
      const apiHandler = handlers[url]
      if (method !== 'POST' || !apiHandler) return null

      /**
       * @type {import('./router.js').FUrlHandler}
       * @param {any} args
       * @returns {Promise<import('./router.js').IServerResponse<{message: string, result: any}>>}
       */
      async function handler(args) {
         try {
            const { message, result, statusCode } = await apiHandler(args)
            return {
               data: { message, result },
               statusCode,
               headers: HEADERS,
            }
         } catch (/** @type {any} */ e) {
            console.error(e)
            const message = e?.message ?? 'Server error'
            return {
               data: { message, result: null },
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
