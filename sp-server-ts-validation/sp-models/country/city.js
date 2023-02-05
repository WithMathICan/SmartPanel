(function () {
   /* @param {import("app/crud").DbRecord} record */
   /** @param {import("sp-interfaces/country/city").Icountry_city} record */
   function beforeSave(record){
      if (record.title.length < 3) throw new Error('Title is very short')
      record.code = sp.func.spSlugify(record.title)
   }

   /**
    * @type {import("../../app/sp-model").FSpModel}
    * @param {import('pg').PoolClient} pg_client 
    */
   function model(pg_client) {
      let baseModel = sp.createSpModel('country', 'city')(pg_client);

      /** @type {import("../../app/sp-model").ISpModel} */
      let modelObj = {
         ...baseModel,
         /** @param {import("sp-interfaces/country/city").Icountry_city} record */
         async update(record){
            beforeSave(record)
            return baseModel.update(record)
         },
         /** @param {import("sp-interfaces/country/city").Icountry_city} record */
         async create(record){
            beforeSave(record)
            return baseModel.create(record)
         }
      }
      
      return modelObj
   }

   return model
})()