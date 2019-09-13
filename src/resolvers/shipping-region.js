/* eslint-disable camelcase */
module.exports = {
  shippingTypes({ shipping_region_id }, args, { loaders }) {
    return loaders.shippingRegion.shippingTypes.load(shipping_region_id)
  },

  tax({ shipping_region_id }, args, { db }) {
    // simple formula!!!
    // accept tax only for US/Canada shipping regions

    // 2 means US/Canada region
    const tax_id = shipping_region_id === 2 ? 1 : 2
    return db
      .first()
      .from('tax')
      .where({ tax_id })
  },
}
