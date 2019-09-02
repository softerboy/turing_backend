module.exports = {
  // eslint-disable-next-line camelcase
  owner({ customer_id }, args, { loaders }) {
    return loaders.review.owner.load(customer_id)
  },
}
