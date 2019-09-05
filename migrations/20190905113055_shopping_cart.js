const tableName = 'shopping_cart'

exports.up = function(knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.engine('MyISAM')

    table
      .increments('item_id')
      .notNullable()
      .primary()
    table.specificType('cart_id', 'CHAR(32)').notNullable()
    table.integer('product_id').notNullable()
    table.string('attributes', 1000).notNullable()
    table.integer('quantity').notNullable()
    table
      .boolean('buy_now')
      .notNullable()
      .defaultTo(true)
    table.dateTime('added_on').notNullable()
    table.index(['cart_id'], 'idx_shopping_cart_cart_id')
  })
}

exports.down = function(knex) {
  return knex.dropTable(tableName)
}
