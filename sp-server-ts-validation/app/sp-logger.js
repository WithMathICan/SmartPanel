'use strict'

const DATETIME_LENGTH = 19;

const { Console } = require('node:console');
const fs = require('node:fs')
const path = require('node:path')

class SpLogger {

   #logger
   #date
   #root

   /** @param {string} root */
   constructor(root) {
      const now = new Date().toLocaleDateString('ru');
      this.#date = now
      this.#root = root
      const file = path.resolve(`sp-tmp/${this.#date}.log`)
      const output = fs.createWriteStream(file, { flags: 'a' });
      this.#logger = new Console({ stdout: output, ignoreErrors: true })
   }

   /** @param  {...any} args */
   log(...args) {
      const now = new Date();
      const date = now.toISOString().substring(0, DATETIME_LENGTH)
      console.log('[LOG]', ...args)
      this.#logger.log(`[LOG  ] [${date}]`, ...args)
   }

   /** @param  {Error} err */
   error(err) {
      const now = new Date();
      const date = now.toISOString().substring(0, DATETIME_LENGTH)
      const stack = err.stack ?? ''
      const st = stack.split('\n')
      const resultMessage = [st[0]];
      for (let i = 1; i < st.length; i++) {
         if (st[i].includes(this.#root)) {
            if (st[i].includes(this.#root + '/node_modules')) continue
            resultMessage.push(st[i].replace(this.#root, '').trim())
         }
      }

      console.error('[ERROR]', err)
      this.#logger.error(`[ERROR] [${date}]`, resultMessage.join(' >> '))
   }
}

const logger = new SpLogger(path.resolve('.'))
module.exports = { logger, SpLogger }
