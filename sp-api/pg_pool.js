'use strict';

const pg = require('pg');
const { DB_SETTINGS } = require('./config');

const pool = new pg.Pool(DB_SETTINGS)

module.exports = {pool}