import {Col} from 'common/col'

export interface ISpApi{
   GetColsData(): Promise<Col[]>
   GetColsEdit(): Promise<Col[]>
   GetColsCreate(): Promise<Col[]>
   GetColsCopy(): Promise<Col[]>
   GetBeans(): Promise<any[]>
   GetBean(id: string): Promise<any>
   SaveBean(bean: any): Promise<any>
   RemoveBeans(ids: string[]) : Promise<string[]>
}

export type TSpApi = Record<string, Record<string, ISpApi>>
export const api: TSpApi