export interface IServerResponse<T> {
   headers: Record<string, string>
   // data: {message: string, result: any}
   data: T
   statusCode: number
}

export type FStaticHandler = (url: string) => Promise<IServerResponse<any>> | null