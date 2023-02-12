import pg from 'pg'

export type DbRecord = {
   [x: string]: any
}

export interface ICrud {
   tableName: string
   query(sql: string, arr: any[]): Promise<import('pg').QueryResult>
   queryFirst(sql: string, arr: any[] = []): Promise<DbRecord | null>
   queryAll(sql: string, arr: any[] = []): Promise<DbRecord[]>
   findById(id: string, fields: string[]): Promise<DbRecord | null>
   read(id: string, fields: string[]): Promise<DbRecord | null>
   create(record: DbRecord): Promise<DbRecord | null>
   update(id: string, record: DbRecord): Promise<DbRecord | null>
   removeMany(ids: string[]): Promise<string[]>
}

export function createCRUD(schema: string, table: string, pg_client: pg.PoolClient): ICrud
export type FCreateCRUD = (schema: string, table: string, pg_client: pg.PoolClient) => ICrud