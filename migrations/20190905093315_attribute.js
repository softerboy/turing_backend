const tableName = 'attribute'

exports.up = function(knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.engine('MyISAM')
    table
      .integer('attribute_id')
      .notNullable()
      .unsigned()
      .primary()

    table.string('name', 100).notNullable()
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable(tableName)
}
