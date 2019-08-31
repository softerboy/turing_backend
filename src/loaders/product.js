function loadAttributes(name, db, ids) {
  return db
    .from('attribute_value as av')
    .select([
      'name',
      'av.attribute_value_id as attribute_id',
      'value',
      'pa.product_id',
    ])
    .innerJoin(
      'product_attribute as pa',
      'pa.attribute_value_id',
      'av.attribute_value_id',
    )
    .innerJoin('attribute as a', 'a.attribute_id', 'av.attribute_id')
    .where('a.name', name)
    .whereIn('pa.product_id', ids)
    .then(attributes =>
      // eslint-disable-next-line camelcase
      ids.map(id => attributes.filter(({ product_id }) => product_id === id)),
    )
}

module.exports = (db, DataLoader) => ({
  colors: new DataLoader(ids => loadAttributes('color', db, ids)),
  sizes: new DataLoader(ids => loadAttributes('size', db, ids)),

  categories: new DataLoader(ids =>
    db
      .select()
      .from('category as c')
      .innerJoin('product_category as pc', 'pc.category_id', 'c.category_id')
      .whereIn('pc.product_id', ids)
      .then(categories =>
        ids.map(id =>
          categories.filter(category => category.product_id === id),
        ),
      ),
  ),
})
