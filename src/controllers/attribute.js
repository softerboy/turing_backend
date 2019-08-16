module.exports = {
  all(parent, { name }, { db }) {
    const query = db
      .select(
        'attribute.name',
        { value: 'attribute_value.value' },
        { attribute_id: 'attribute_value.attribute_value_id' },
      )
      .from('attribute')
      .innerJoin(
        'attribute_value',
        'attribute.attribute_id',
        'attribute_value.attribute_id',
      )

    if (name) return query.where('attribute.name', name)

    return query
  },
}
