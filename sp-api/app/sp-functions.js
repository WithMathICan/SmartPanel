'use strict';

const { Col } = require('common/col');
const {Fk} = require('common/fk')
const {queryAll} = require('./pg_pool');
const { DB_SETTINGS } = require('../config');
/** @typedef {import("common/col").IFk} IFk */

const MY_SQL_COLS = `SELECT * from information_schema.columns 
                     where table_catalog = $1 and table_schema = $2 and table_name = $3`;

const MY_SQL_FK_SAME_SCHEMA = `SELECT
   tc.table_schema, 
   tc.constraint_name, 
   tc.table_name, 
   kcu.column_name, 
   ccu.table_schema AS foreign_table_schema,
   ccu.table_name AS foreign_table_name,
   ccu.column_name AS foreign_column_name 
   FROM 
   information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
   ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
   JOIN information_schema.constraint_column_usage AS ccu
   ON ccu.constraint_name = tc.constraint_name
   AND ccu.table_schema = tc.table_schema
   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=$1 AND tc.table_name=$2`

const MY_SQL_FK = `SELECT
   tc.table_schema, 
   tc.constraint_name, 
   tc.table_name, 
   kcu.column_name, 
   ccu.table_schema AS foreign_table_schema,
   ccu.table_name AS foreign_table_name,
   ccu.column_name AS foreign_column_name 
   FROM 
   information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
   ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
   JOIN information_schema.constraint_column_usage AS ccu
   ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=$1 AND tc.table_name=$2`




module.exports = {
   /**
    * 
    * @param {string} schema 
    * @param {string} table 
    * @returns {Col[]}
    */
   async spCreateCols(schema, table) {
      let db_cols = await queryAll(MY_SQL_COLS, [DB_SETTINGS.database, schema, table])
      let cols = db_cols.map(el => new Col(el))
      /** @type {IFk[]} */
      let db_fk = await queryAll(MY_SQL_FK, [schema, table]) 

      for (let fk of db_fk){
         let col = cols.find(el => el.column_name === fk.column_name)
         if (col){
            col.data_type = 'fk'
            col.fk = new Fk(fk, 'name')
         }  
      }

      return cols
   },

   spTableName: (schema, table) => `${schema}.${table}`
}