const { product } = require('../controllers')

module.exports = {
  colors(parent, args, context, info) {
    return product.colors(parent, args, context, info)
  },

  sizes(parent, args, context, info) {
    return product.sizes(parent, args, context, info)
  },

  categories(parent, args, context, info) {
    return product.categories(parent, args, context, info)
  },

  reviews(parent, args, context, info) {
    return product.reviews(parent, args, context, info)
  },
}
