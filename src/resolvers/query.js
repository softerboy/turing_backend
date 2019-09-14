const { createToken } = require('../utils')
const {
  department,
  attribute,
  product,
  cart,
  shippingRegion,
  order,
} = require('../controllers')

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

  product(parent, args, context) {
    return product.find(parent, args, context)
  },

  generateUniqueCartId() {
    return cart.generateUniqueId()
  },

  cart(parent, args, context) {
    return cart.get(parent, args, context)
  },

  getSaved(parent, args, context) {
    return cart.getSaved(parent, args, context)
  },

  totalAmount(parent, args, context) {
    return cart.totalAmount(parent, args, context)
  },

  shippingRegions(parent, args, context) {
    return shippingRegion.all(parent, args, context)
  },

  orderFee(parent, args, context) {
    return order.fees(parent, args, context)
  },
}
