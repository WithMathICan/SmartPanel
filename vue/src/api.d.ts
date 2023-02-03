

import {Col} from '../../sp-server-ts-validation/classes/Col'

export type DbRecord = {
   [x: string]: any
}

export {Col}

export interface ISpApi {
   GetCols() : Promise<Col[]>
   GetBean(id: string, fields = ['*']): Promise<DbRecord | null>
   GetBeans(fields = ['*']): Promise<DbRecord[]>
   CreateBean(record: DbRecord): Promise<DbRecord | null>
   UpdateBean(record: DbRecord): Promise<DbRecord | null>
   RemoveBeans(ids: string[]): Promise<string[]>
}

// export interface ISpApi{
//    GetColsData(): Promise<Col[]>
//    GetColsEdit(): Promise<Col[]>
//    GetColsCreate(): Promise<Col[]>
//    GetColsCopy(): Promise<Col[]>
//    GetBeans(): Promise<any[]>
//    GetBean(id: string): Promise<any>
//    SaveBean(bean: any): Promise<any>
//    RemoveBeans(ids: string[]) : Promise<string[]>
// }

export type TSpApi = Record<string, Record<string, ISpApi>>
export const api: TSpApi
export type TMsgSeverity = 'warn' | 'success' | 'info' | 'error'

export interface IMessage {
   id: string 
   content: string 
   life: number 
   severity: TMsgSeverity
   closable: boolean 
   timeOut: NodeJS.Timeout
   closeTime: number
}