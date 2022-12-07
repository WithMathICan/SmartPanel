'use strict'

const assert = require('node:assert');
const http = require('node:http');

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   'X-Content-Type-Options': 'nosniff',
   'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
   'Content-Type': 'application/json; charset=UTF-8',
};

const receiveArgs = async (req) => {
   try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString();
      if (!data) return {}
      let parsedData = JSON.parse(data);
      assert(typeof parsedData === 'object', "ParsedData shold be an object")
      return parsedData
   } catch (e) {
      console.log(e);
      return {}
   }
};


/**
 * 
 * @param {Record<string, string[]>} db_tables 
 * @param {Record<string, Function>} actions 
 * @param {number} port 
 */
module.exports = function server(actions, port) {
   http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=UTF-8')
      res.setHeader('Access-Control-Allow-Origin', '*',)
      res.statusCode = 404
      let { url, socket, method } = req
      console.log(socket.remoteAddress, method, url);

      if (method === 'POST') {
         let handler = actions[url]
         if (!handler) return res.end("Not Found");
         let args = await receiveArgs(req)
         try {
            console.log({ args });
            let { statusCode, result, message } = await handler(args)
            res.statusCode = statusCode
            return res.end(JSON.stringify({ message, result }))
         }
         catch (e) {
            console.error(e);
            res.statusCode = 500
            return res.end(JSON.stringify({ message: "Server error" }))
         }
      }

      res.end("Not Found")
   }).listen(port, () => console.log("Api server started on port ", port))
}
