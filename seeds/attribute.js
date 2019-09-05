const tableName = 'attribute'

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex(tableName)
    .del()
    .then(function() {
      // Inserts seed entries
      return knex(tableName).insert([
        { attribute_id: 1, name: 'Size' },
        { attribute_id: 2, name: 'Color' },
      ])
    })
}
