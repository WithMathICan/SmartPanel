export interface IServerResponse {
   headers: Record<string, string>
   data: any
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

export interface IRouterResult{
   handler: (args:any) => Promise<IServerResponse>,
   urlArgs: any
}

export type FRouter = (method: string, url: string) => Promise<IServerResponse | null>