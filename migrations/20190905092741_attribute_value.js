const tableName = 'attribute_value'

exports.up = function(knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.engine('MyISAM')
    table
      .increments('attribute_value_id')
      .notNullable()
      .primary()
    table.integer('attribute_id').notNullable()
    table.string('value', 100).notNullable()
    table.index(['attribute_id'], 'idx_attribute_value_attribute_id')
  })
}

exports.down = function(knex) {}
