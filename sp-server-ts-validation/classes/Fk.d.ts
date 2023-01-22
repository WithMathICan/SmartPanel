export interface IFk{
   table_schema: string
   constraint_name: string
   table_name: string
   column_name: string
   foreign_table_schema: string
   foreign_table_name: string
   foreign_column_name: string
}

export class Fk {
   foreign_table_schema = '';
   foreign_table_name = '';
   foreign_column_name = '';
   foreign_title_column_name = '';

   constructor(data: IFk, title_column = 'title')
}