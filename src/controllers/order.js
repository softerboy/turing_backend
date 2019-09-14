/* eslint-disable camelcase */
const cartController = require('./cart')
const taxController = require('./tax')

module.exports = {
  async fees(parent, args, { db }) {
    const { shipping_region_id, shipping_id, cart_id } = args

    const cartAmount = await cartController.totalAmount(
      parent,
      { cart_id },
      { db },
    )

    const { tax_percentage } = await taxController.byShippingRegion(
      { shipping_region_id },
      args,
      { db },
    )

    const { shipping_cost } = await db
      .first(['shipping_cost'])
      .from('shipping')
      .where({ shipping_id })

    const tax_cost = Number(cartAmount * tax_percentage * 0.01)
    return [
      {
        type: 'subtotal',
        title: 'Subtotal',
        value: Number(cartAmount),
      },
      {
        type: 'shipping_cost',
        title: 'Shipping cost',
        value: Number(shipping_cost),
      },
      {
        type: 'sales_tax',
        title: 'Sales tax',
        value: tax_cost.toFixed(2),
      },
      {
        type: 'total',
        title: 'Total',
        value: (
          Number(cartAmount) +
          Number(shipping_cost) +
          Number(tax_cost)
        ).toFixed(2),
      },
    ]
  },
}
