const tableName = 'product'

exports.up = function(knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.engine('MyISAM')
    table
      .increments('product_id')
      .unsigned()
      .notNullable()
      .primary()

    table.string('name', 100).notNullable()
    table.string('description', 1000).notNullable()
    table.float('price', 10, 2).notNullable()
    table
      .float('discounted_price', 10, 2)
      .notNullable()
      .defaultTo(0.0)

    table.string('image', 150)
    table.string('image_2', 150)
    table.string('thumbnail', 150)
    table
      .specificType('display', 'SMALLINT(6)')
      .notNullable()
      .defaultTo(0)

    table.index(
      ['name', 'description'],
      'idx_ft_product_name_description',
      'FULLTEXT',
    )
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable(tableName)
}
