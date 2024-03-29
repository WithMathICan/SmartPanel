(function() {
   /* @param {import("app/crud").DbRecord} record */
   /** @param {import("sp-interfaces/country/city").Icountry_city} record */
   function beforeSave(record) {
      if (record.title.length < 3) throw new Error('Title is very short');
      record.code = sp.func.spSlugify(record.title);
   }

   /**
    * @type {import("../sp-model").FSpModel}
    * @param {import('pg').PoolClient} pgClient
    */
   function model(pgClient) {
      const baseModel = sp.createSpModel('country', 'city')(pgClient);

      /** @type {import("../sp-model").ISpModel} */
      const modelObj = {
         ...baseModel,
         /** @param {import("sp-interfaces/country/city").Icountry_city} record */
         async update(record) {
            beforeSave(record);
            return baseModel.update(record);
         },
         /** @param {import("sp-interfaces/country/city").Icountry_city} record */
         async create(record) {
            beforeSave(record);
            return baseModel.create(record);
         }
      };
      return modelObj;
   }

   return model;
})();
