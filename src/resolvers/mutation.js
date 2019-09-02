const { customer, product } = require('../controllers')

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

  addProductReview(parent, args, context, info) {
    return product.addReview(parent, args, context, info)
  },
}
