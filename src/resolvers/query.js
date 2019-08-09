const { createToken } = require('../utils')

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
}
