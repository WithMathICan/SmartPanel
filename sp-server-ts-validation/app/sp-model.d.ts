import { Col } from 'classes/Col'
import { DbRecord, FCreateCRUD } from './crud'
import {PoolClient, Pool} from 'pg'

export interface ISpModel {
   cols() : Promise<Col[]>
   bean(id: string, fields = ['*']): Promise<DbRecord | null>
   beans(fields = ['*']): Promise<DbRecord[]>
   create(record: DbRecord): Promise<DbRecord | null>
   update(record: DbRecord): Promise<DbRecord | null>
   removeMany(ids: string[]): Promise<string[]>
}

export type FSpModel = (pg_client: PoolClient | Pool) => ISpModel;
export type FCreateSpModel = (schema: string, table: string, createCrud: FCreateCRUD) => FSpModel
export function createSpModel(schema: string, table: string, createCrud: FCreateCRUD) : FSpModel
