import { Fk } from "./Fk";

export type TColType = 'number' | 'varchar' | 'date' | 'fk' | 'm2m' | 'id';

export interface IDbCol{
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

   constructor(col_data: IDbCol)
}