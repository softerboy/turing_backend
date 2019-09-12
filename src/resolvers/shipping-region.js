module.exports = {
  // eslint-disable-next-line camelcase
  shippingTypes({ shipping_region_id }, args, { loaders }) {
    return loaders.shippingRegion.shippingTypes.load(shipping_region_id)
  },
}
