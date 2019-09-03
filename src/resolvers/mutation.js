const { customer, product, cart } = require('../controllers')

module.exports = {
  customerRegister(parent, formData, context, info) {
    return customer.add(parent, formData, context, info)
  },

  customerLogin(parent, formData, context, info) {
    return customer.login(parent, formData, context, info)
  },

  customerLogout(parent, args, context) {
    return customer.logout(parent, args, context)
  },

  addProductReview(parent, args, context) {
    return product.addReview(parent, args, context)
  },

  addToCart(parent, args, context) {
    return cart.add(parent, args, context)
  },
}
