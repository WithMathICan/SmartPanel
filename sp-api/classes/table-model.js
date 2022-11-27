const pg = require('pg');

const MY_SQL_COLS = "SELECT * from information_schema.columns where table_catalog = $1 and table_schema = $2 and table_name = $3";

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

class Col{
   table_catalog
   table_schema
   table_name
   column_name
   is_primary_key
   is_nullable
   ordinal_position
   column_default

   /**
    * 
    * @param {DbCol} col_data
    */
   constructor(col_data){
      this.table_catalog = col_data.table_catalog
      this.table_schema = col_data.table_schema
      this.table_name = col_data.table_name
      this.column_name = col_data.column_name
      this.is_primary_key = col_data.is_identity === 'YES'
      this.is_nullable = col_data.is_nullable === 'YES'
      this.ordinal_position = col_data.ordinal_position
      this.column_default = col_data.column_default
   }

}

module.exports = {TableModel, Col}