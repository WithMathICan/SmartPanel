'use strict'

const path = require('node:path')
const SMART_PANEL_PATH = '/smart-panel'

module.exports = {
   DB_SCHEMAS: ['public'],
   DB_SETTINGS: {
      database: 'example', 
      user: 'marcus', 
      password: 'marcus', 
      host: '127.0.0.1',  
      port: 5432
   },
   SERVER_PORT: 3000,
   STATIC_SERVER_PORT: 3003,
   API_FOLDER: path.resolve('./api'),
   SMART_PANEL_PATH,
   SMART_PANEL_API_PREFIX: '/api' + SMART_PANEL_PATH
}