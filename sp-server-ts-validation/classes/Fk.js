/* eslint-disable camelcase */
'use strict'

class Fk {
   foreign_table_schema = '';
   foreign_table_name = '';
   foreign_column_name = '';
   foreign_title_column_name = '';

   /** @param {import("./Fk").IFk} data */
   constructor(data, title_column = 'title') {
      this.foreign_table_schema = data.foreign_table_schema
      this.foreign_table_name = data.foreign_table_name
      this.foreign_column_name = data.foreign_column_name
      this.foreign_title_column_name = title_column
   }
}

module.exports = { Fk }
