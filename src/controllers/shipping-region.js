module.exports = {
  all(parent, args, { db }) {
    return db.select().from('shipping_region')
  },
}
