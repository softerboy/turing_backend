/* eslint-disable camelcase */
const tableName = 'product_attribute'

exports.seed = async function(knex) {
  const products = await knex.select(['product_id']).from('product')
  const attributeValues = await knex
    .select(['attribute_value_id'])
    .from('attribute_value')

  const entries = []
  products.forEach(({ product_id }) => {
    attributeValues.forEach(({ attribute_value_id }) => {
      entries.push({ product_id, attribute_value_id })
    })
  })

  // Deletes ALL existing entries
  return knex(tableName)
    .del()
    .then(function() {
      // Inserts seed entries
      return knex(tableName).insert(entries)
    })
}
