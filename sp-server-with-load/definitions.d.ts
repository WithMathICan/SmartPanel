import {IApiResult} from 'sp-common/main'
import {PoolClient} from 'pg'

export interface IServerResponse {
   headers: Record<string, string>
   data: {message: string, result: any}
   statusCode: number
}

export interface IDbSettings {
   database: string,
   user: string,
   password: string,
   host: string,
   port: number
}

export interface IConfig {
   DB_SCHEMAS: string[],
   DB_SETTINGS: IDbSettings,
   SP_NAME: string,
   PORT: number,
}

// export interface IRouterResult{
//    handler: (args:any) => Promise<IServerResponse>,
// }

export type ApiHandler = (args:any) => Promise<IApiResult<any>>
export type RouteHandler = (args:any) => Promise<IServerResponse>
export type TableApi = (pg_client: PoolClient) => IApiResult
export type FRouter = (method: string, url: string) => Promise<IServerResponse | null>
export type ApiRouter = (method: string, url: string) => Promise<RouteHandler | null>