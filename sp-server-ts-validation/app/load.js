'use strict';

const vm = require('node:vm');

const RUN_OPTIONS = { timeout: 5000, displayErrors: true };

/**
 * @param {string} codeSrc
 * @param {any} sandbox
 */
module.exports = (codeSrc, sandbox) => {
   const code = `'use strict';\n${codeSrc}`;
   const script = new vm.Script(code);
   const context = vm.createContext(sandbox);
   const exported = script.runInContext(context, RUN_OPTIONS);
   return exported;
};
