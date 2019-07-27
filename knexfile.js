require('dotenv-flow').config()

const {
  DB_DEBUG,
  DB_DIALECT,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  DB_USER,
} = process.env

module.exports = {
  debug: Boolean(DB_DEBUG),
  client: DB_DIALECT,
  connection: {
    database: DB_NAME,
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  },
}
