export type TColType = 'number' | 'varchar' | 'date' | 'fk' | 'm2m' | 'id';

export class Fk {
   foreign_table_schema: string
   foreign_table_name: string
   foreign_column_name: string
   foreign_title_column_name: string

   constructor(data: IFk, title_column = 'title')
}

export interface DbCol{
   table_catalog: string, 
   table_schema: string, 
   table_name: string, 
   column_name: string,
   is_identity: 'YES' | 'NO'
   is_nullable: 'YES' | 'NO'
   data_type: 'bigint' | 'character varying'
   ordinal_position: number
   udt_name: string
   column_default: any
}

export interface IFk{
   table_schema: string
   constraint_name: string
   table_name: string
   column_name: string
   foreign_table_schema: string
   foreign_table_name: string
   foreign_column_name: string
}

export interface IApiResult<T>{
   statusCode: number
   message?: string
   result?: T
}


export class Col{
   table_catalog: string
   table_schema: string
   table_name: string
   column_name: string
   is_primary_key: boolean
   is_nullable: boolean
   ordinal_position: number
   column_default: any
   data_type: TColType
   fk?: Fk

   constructor(col_data: DbCol)
}

export interface ITableApi{
   cols() : Promise<IApiResult<Col[]>>
   beans(args: {fields?: string[]}) : Promise<IApiResult<any[]>>
   bean(args: {id: string, fields?: string[]}) : Promise<IApiResult<any>>
   save(args: {bean: any}) : Promise<IApiResult<any>>
   remove(args: {ids: string[]}) : Promise<IApiResult<string[]>>
}







