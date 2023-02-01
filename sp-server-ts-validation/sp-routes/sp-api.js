'use strict'

const fs = require('node:fs')
const { createCRUD } = require('../app/crud.js')
const func = require('../app/sp-functions.js')
const load = require('../app/load.js')
const modelSrc = fs.readFileSync('app/sp-model.js', { encoding: 'utf8' })
const controllerSrc = fs.readFileSync('app/sp-controller.js', { encoding: 'utf-8' })
const { logger } = require('../app/sp-logger.js')

function readSpModel() {
   let sandbox = Object.freeze({ console: logger, sp: { createCRUD, func } })
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
 * @param {Record<string, string[]>} db_tables 
 * @returns {Record<string, import("app/sp-model").FSpModel>}
 */
function createApiModels(db_tables) {
   /** @type {Record<string, import("app/sp-model").FSpModel>} */
   let models = {}
   let createSpModel = readSpModel()
   let sandbox = Object.freeze({ createSpModel, console: logger, sp: { func } })
   for (let schema in db_tables) {
      for (let table of db_tables[schema]) {
         let key = `${schema}.${table}`
         models[key] = load(`createSpModel('${schema}', '${table}');`, sandbox)
      }
   }
   return models
}

/**
 * @param {Record<string, string[]>} db_tables 
 * @param {import('pg').Pool} pool 
 * @returns {Record<string, import("app/sp-model").FSpModel>}
 */
function createApiControllers(db_tables, pool) {
   /** @type {Record<string, import("app/sp-model").FSpModel>} */
   let controllers = {}
   let models = createApiModels(db_tables)
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

module.exports = { createApiControllers }
