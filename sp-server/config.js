'use strict'

const path = require('node:path')

/** @type {import('./app/definitions').IConfig} */
const config = {
   DB_SCHEMAS: ['public', 'blog'],
   DB_SETTINGS: {
      database: 'example', 
      user: 'postgres', 
      password: 'root', 
      host: '127.0.0.1',  
      port: 5432
   },
   PORT: 3000,
   SP_NAME: 'smart-panel'
}

module.exports = config