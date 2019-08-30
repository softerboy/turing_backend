const { product } = require('../controllers')

module.exports = {
  colors(parent, args, context, info) {
    return product.colors(parent, args, context, info)
  },

  sizes(parent, args, context, info) {
    return product.sizes(parent, args, context, info)
  },
}
