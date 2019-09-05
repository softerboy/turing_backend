const tableName = 'attribute_value'

exports.seed = async function(knex) {
  const entries = [
    { attribute_value_id: 1, attribute_id: 1, value: 'S' },
    { attribute_value_id: 2, attribute_id: 1, value: 'M' },
    { attribute_value_id: 3, attribute_id: 1, value: 'L' },
    { attribute_value_id: 4, attribute_id: 1, value: 'XL' },
    { attribute_value_id: 5, attribute_id: 1, value: 'XXL' },
    { attribute_value_id: 6, attribute_id: 2, value: 'White' },
    { attribute_value_id: 7, attribute_id: 2, value: 'Black' },
    { attribute_value_id: 8, attribute_id: 2, value: 'Red' },
    { attribute_value_id: 9, attribute_id: 2, value: 'Orange' },
    { attribute_value_id: 10, attribute_id: 2, value: 'Yellow' },
    { attribute_value_id: 11, attribute_id: 2, value: 'Green' },
    { attribute_value_id: 12, attribute_id: 2, value: 'Blue' },
    { attribute_value_id: 13, attribute_id: 2, value: 'Indigo' },
    { attribute_value_id: 14, attribute_id: 2, value: 'Purple' },
  ]

  // Deletes ALL existing entries
  return knex(tableName)
    .del()
    .then(function() {
      // Inserts seed entries
      return knex(tableName).insert(entries)
    })
}
