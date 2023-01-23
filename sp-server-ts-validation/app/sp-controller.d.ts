import {Pool} from 'pg'

export interface IApiResult<T>{
   statusCode: number
   message: string
   result: T
}

export interface ITableApi{
   cols() : Promise<IApiResult<Col[]>>
   bean(id: string, fields = ['*']): Promise<IApiResult<DbRecord | null>>
   beans(fields = ['*']): Promise<IApiResult<DbRecord[]>>
   create(record: DbRecord): Promise<IApiResult<DbRecord | null>>
   update(record: DbRecord): Promise<IApiResult<DbRecord | null>>
   removeMany(ids: string[]): Promise<IApiResult<string[]>>
}

export type FCreateSpController = (schema: string, table: string, pool: Pool) => ITableApi
export function createSpController(schema: string, table: string, pool: Pool) : ITableApi