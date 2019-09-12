module.exports = (db, DataLoader) => ({
  shippingTypes: new DataLoader(ids =>
    db
      .select()
      .from('shipping')
      .whereIn('shipping_region_id', ids)
      .then(result =>
        ids.map(id =>
          result.filter(shipping => shipping.shipping_region_id === id),
        ),
      ),
  ),
})
