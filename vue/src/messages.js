import { reactive } from "vue"

export const messages = reactive({})

/**
 * 
 * @param {string} content 
 * @param {number} life Time in miliseconds
 * @param {'warn' | 'success' | 'info' | 'error' } severity 
 * @param {boolean} closable 
 */
export function showMessage(content, life, severity, closable = true){
   let existingMessage = findMsg({content, severity, closable})
   if (existingMessage){
      clearTimeout(existingMessage.timeOut)
      existingMessage.timeOut = setTimeout(() => { delete messages[existingMessage.id] }, life)
      existingMessage.closeTime = Date.now() + life
   }
   else addMessage(content, life, severity, closable)
}

export function msgClose(id){
   delete messages[id]
}

function msgsIsAlmostCoincide(msg1, msg2){
   return msg1.content === msg2.content && msg1.severity === msg2.severity && msg1.closable === msg2.closable
}

function findMsg(msg){
   for (let key in messages) {
      if (msgsIsAlmostCoincide(messages[key], msg)) {
         return messages[key]
      }
   }
}

/**
 * 
 * @param {string} content 
 * @param {number} life Time in miliseconds
 * @param {'warn' | 'success' | 'info' | 'error' } severity 
 * @param {boolean} closable 
 */
function addMessage(content, life, severity, closable){
   let id = Math.random()
   let timeOut = setTimeout(() => { delete messages[id] }, life)
   messages[id] = {id, content, life, severity, closable, timeOut, closeTime: Date.now() + life}
}

