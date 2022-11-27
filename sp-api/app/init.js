'use strict'

const { DB_SCHEMAS } = require("../config")
const {pool} = require('../pg_pool')


async function init(){
   for(let schema of DB_SCHEMAS){
      console.log(schema);
   }
}

module.exports = {init}