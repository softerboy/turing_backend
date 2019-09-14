const { tax } = require('../controllers')

/* eslint-disable camelcase */
module.exports = {
  shippingTypes({ shipping_region_id }, args, { loaders }) {
    return loaders.shippingRegion.shippingTypes.load(shipping_region_id)
  },

  tax({ shipping_region_id }, args, { db }) {
    return tax.byShippingRegion({ shipping_region_id }, args, { db })
  },
}
