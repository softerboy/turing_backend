/* eslint-disable camelcase */
module.exports = {
  byShippingRegion({ shipping_region_id }, args, { db }) {
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
