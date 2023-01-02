import {IResponseResult} from 'common/main'

export interface IServerResponse{
   headers: Record<string, string>
   data: any
   statusCode: number
}

export interface IRoute<T>{
   method: 'GET' | 'POST'
   check: (url: string) => boolean
   handler: (args: any) => Promise<IServerResponse>
}