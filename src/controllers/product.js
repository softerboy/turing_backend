module.exports = {
  priceRange(parent, args, { db }) {
    return db
      .max({ max: 'price' })
      .min({ min: 'price' })
      .from('product')
      .then(rows => rows[0])
  },
}
