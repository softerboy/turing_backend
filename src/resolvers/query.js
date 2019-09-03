const { createToken } = require('../utils')
const { department, attribute, product, cart } = require('../controllers')

module.exports = {
  me(parent, args, { koaCtx }) {
    const { customer } = koaCtx

    if (customer) {
      /* eslint-disable camelcase */
      const { customer_id } = customer
      // refresh customer's token
      customer.accessToken = createToken({ customer_id })
      customer.expires_in = process.env.JWT_EXPIRES_IN
    }
    return customer
  },

  departments(parent, args, context, info) {
    return department.all(parent, args, context, info)
  },

  attributes(parent, args, context) {
    return attribute.all(parent, args, context)
  },

  priceRange(parent, args, context) {
    return product.priceRange(parent, args, context)
  },

  products(parent, args, context, info) {
    return product.all(parent, args, context, info)
  },

  product(parent, args, context, info) {
    return product.find(parent, args, context, info)
  },

  generateUniqueCartId() {
    return cart.generateUniqueId()
  },
}
