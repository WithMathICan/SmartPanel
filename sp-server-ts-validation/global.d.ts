import { ISpModel } from 'app/sp-model'
import * as spFunctions from './app/sp-functions'

export global {
   namespace sp{
      const func: typeof spFunctions
      const PG_DATABASE: string
      const models: Record<string, ISpModel>
   }
}