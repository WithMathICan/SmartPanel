'use strict'

const { Fk } = require('./Fk')

class Col{
   /** @type {string} */ table_catalog
   /** @type {string} */ table_schema
   /** @type {string} */ table_name
   /** @type {string} */ column_name
   /** @type {boolean} */ is_primary_key
   /** @type {boolean} */ is_nullable
   /** @type {number} */ ordinal_position
   /** @type {any} */ column_default
   /** @type {import('sp-common').TColType} */ data_type
   /** @type {Fk | undefined} */ fk

   /** @param {import('./Col').IDbCol} col_data */
   constructor(col_data){
      this.table_catalog = col_data.table_catalog
      this.table_schema = col_data.table_schema
      this.table_name = col_data.table_name
      this.column_name = col_data.column_name
      this.is_primary_key = col_data.is_identity === 'YES'
      this.is_nullable = col_data.is_nullable === 'YES'
      this.ordinal_position = col_data.ordinal_position
      this.column_default = col_data.column_default
      this.data_type = defineDataType(col_data)
   }
}

/**
 * @param {import('./Col').IDbCol} col
 * @returns {import('./Col').TColType}
 */
function defineDataType(col){
   if (col.column_name === 'id') return 'id'
   if (col.data_type.includes('timestamp')) return 'date'
   if (col.udt_name.includes('int') || col.udt_name.includes('float') || col.udt_name.includes('numeric') ||
         col.data_type.includes('real') || col.data_type.includes('numeric')){
      return 'number'
   }
   return 'varchar'
}

module.exports = {Col}
