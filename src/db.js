const knex = require('knex')

const {
  DB_DEBUG,
  DB_DIALECT,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  DB_USER,
} = process.env

const db = knex({
  debug: Boolean(DB_DEBUG),
  client: DB_DIALECT,
  connection: {
    database: DB_NAME,
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
    afterCreate: function(conn, cb) {
      // this will disable sql_mode=only_full_group mode
      conn.query('SET sql_mode="NO_ENGINE_SUBSTITUTION";', function(err) {
        cb(err, conn)
      })
    },
  },
})

module.exports = db
