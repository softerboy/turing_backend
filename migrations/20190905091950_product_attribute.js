const tableName = 'product_attribute'

exports.up = function(knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.engine('MyISAM')
    table.integer('product_id').notNullable()
    table.integer('attribute_value_id').notNullable()
    table.primary(['product_id', 'attribute_value_id'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable(tableName)
}
