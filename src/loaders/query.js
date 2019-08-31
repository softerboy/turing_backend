module.exports = (db, DataLoader) => ({
  product: new DataLoader(ids =>
    db
      .select()
      .from('product')
      .where('product_id', ids[0]),
  ),
})
