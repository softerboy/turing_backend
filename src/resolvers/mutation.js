const { customer } = require('../controllers')

module.exports = {
  customerRegister(parent, formData, context, info) {
    return customer.add(parent, formData, context, info)
  },

  customerLogin(parent, formData, context, info) {
    return customer.login(parent, formData, context, info)
  },
}
