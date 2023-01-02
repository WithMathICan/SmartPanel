const { indexHtml } = require("./app/staticServer")

module.exports = (sp_path, sp_assets) => {

   /** @type {import("./app/server").IRoute<any>[]} */
   const routes = [
      {
         method: 'GET',
         check: url => url.startsWith(sp_path),
         handler: indexHtml(sp_assets)
      }
   ]

   return routes
}