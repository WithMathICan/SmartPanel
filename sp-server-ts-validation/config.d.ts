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

export const config: IConfig
