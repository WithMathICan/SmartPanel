export interface IServerResponse<T> {
   headers: Record<string, string>
   data: T
   statusCode: number
}

export type FStaticHandler = (url: string) => Promise<IServerResponse<any>> | null
export type FUrlHandler = (args: any) => Promise<IServerResponse<{message: string, result: any}>>
export type FRouter = (method: string, url: string) => FUrlHandler