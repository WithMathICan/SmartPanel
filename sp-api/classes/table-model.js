const pg = require('pg');
const { Col } = require('common/col');

const MY_SQL_COLS = `SELECT * from information_schema.columns 
                     where table_catalog = $1 and table_schema = $2 and table_name = $3`;

class TableModel{
   table_catalog
   schema
   table
   table_name
   pg_client
   /** @type Col[] */ cols

   /**
    * 
    * @param {string} table_catalog 
    * @param {string} schema 
    * @param {string} table 
    * @param {pg.PoolClient} pg_client 
    */
   constructor(table_catalog, schema, table, pg_client){
      this.table_catalog = table_catalog
      this.schema = schema
      this.table = table
      this.table_name = schema + '.' + table
      this.pg_client = pg_client
   }

   async CreateCols(){
      let {rows} = await this.pg_client.query(MY_SQL_COLS, [this.table_catalog, this.schema, this.table])
      this.cols = rows.map(el => new Col(el))
   }
}



module.exports = {TableModel}