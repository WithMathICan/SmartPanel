import { FCreateSpModel, FSpModel, ISpModel } from './app/sp-model'
import * as spFunctions from './app/sp-functions'
import { FCreateCRUD } from './app/crud'

type TSpFunc = typeof spFunctions;

export global {
   namespace sp{
      const func: TSpFunc
      const PG_DATABASE: string
      const createCRUD: FCreateCRUD
      const models: Record<string, FSpModel>
      const createSpModel: FCreateSpModel
   }
}

// export interface ISp{
//    func: spFunctions
//    PG_DATABASE: string
//    createCRUD: FCreateCRUD
//    models: Record<string, FSpModel>
// }