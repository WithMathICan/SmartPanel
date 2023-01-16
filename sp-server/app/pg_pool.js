'use strict';

const pg = require('pg');
const { DB_SETTINGS } = require('../config');

const pool = new pg.Pool(DB_SETTINGS)

const queryFirst = async (sql, arr = []) => {
   let {rows} = await pool.query(sql, arr)
   return rows[0]
}

const queryAll = async (sql, arr = []) => {
   let {rows} = await pool.query(sql, arr)
   return rows
}

module.exports = {pool, queryFirst, queryAll}