exports.up = function(knex) {
  return knex.schema.createTable('customer', function(table) {
    table.engine('MyISAM')
    table
      .increments('customer_id')
      .unsigned()
      .notNullable()
      .primary()

    table.string('name', 50).notNullable()
    table
      .string('email', 100)
      .notNullable()
      .unique('idx_customer_email')
    table.string('password', 50).notNullable()
    table.text('credit_card').nullable()
    table.string('address_1', 100).nullable()
    table.string('address_2', 100).nullable()
    table.string('city', 100).nullable()
    table.string('region', 100).nullable()
    table.string('postal_code', 100).nullable()
    table.string('country', 100).nullable()
    table
      .integer('shipping_region_id')
      .notNullable()
      .defaultTo(1)
      .index('idx_customer_shipping_region_id')
    table.string('day_phone', 100).nullable()
    table.string('eve_phone', 100).nullable()
    table.string('mob_phone', 100).nullable()
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('customer')
}
