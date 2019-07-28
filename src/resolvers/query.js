module.exports = {
  me(parent, args, { koaCtx }) {
    return koaCtx.customer
  },
}
