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

  updateCart(parent, args, info) {
    return cart.update(parent, args, info)
  },

  emptyCart(parent, args, context) {
    return cart.empty(parent, args, context)
  },

  moveToCart(parent, args, context) {
    return cart.moveToCart(parent, args, context)
  },

  saveForLater(parent, args, context) {
    return cart.saveForLater(parent, args, context)
  },
}
