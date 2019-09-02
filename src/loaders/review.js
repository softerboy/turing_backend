module.exports = (db, DataLoader) => ({
  owner: new DataLoader(ids =>
    db
      .select(['name', 'customer_id', 'email'])
      .from('customer')
      .where('customer_id', ids[0]),
  ),
})
