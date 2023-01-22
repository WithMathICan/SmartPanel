import {PoolClient, Pool} from 'pg'

export function spCreateCols(schema: string, table: string, database: string, pg_client: PoolClient) : Promise<Col[]>
export function spFindDbTables(schemas: string[], pg_client: Pool) : Promise<Record<string, string[]>>

