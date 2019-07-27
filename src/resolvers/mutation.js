const customer = require('../dao')

module.exports = {
  customerRegister(parent, formData, context, info) {
    return customer.add(parent, formData, context, info)
  },
}
