/* eslint-disable camelcase */
const { ApolloError } = require('apollo-server-koa')
const Stripe = require('stripe')

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

  async create(parent, args, context) {
    const tableName = 'orders'
    const { db, koaCtx } = context
    const { shipping_region_id, shipping_id, cart_id } = args

    const { tax_id } = await taxController.byShippingRegion(
      { shipping_region_id },
      args,
      { db },
    )

    // check is user logged in
    if (!koaCtx.customer) throw new ApolloError('Anonymous user', 'USR_01')

    // create an order
    const { customer_id } = koaCtx.customer
    await db(tableName).insert({
      created_on: db.fn.now(),
      customer_id,
      shipping_id,
      tax_id,
    })

    // prettier-ignore
    const res = await db.raw(`SELECT LAST_INSERT_ID() as order_id FROM ${tableName}`)
    const { order_id } = res[0][0]

    const fees = await this.fees(parent, args, context)
    const { value: amount } = fees.find(({ type }) => type === 'total')

    // update order_detail
    const resultSet = await db
      .select([
        'p.product_id',
        'sc.attributes',
        'p.name as product_name',
        'sc.quantity',
        db.raw('COALESCE(NULLIF(p.discounted_price, 0), p.price) AS unit_cost'),
      ])
      .from('shopping_cart as sc')
      .innerJoin('product as p', 'p.product_id', 'sc.product_id')
      .where('sc.cart_id', cart_id)
      .andWhere('sc.buy_now', true)

    const orderDetails = resultSet.map(row => ({
      ...row,
      order_id,
    }))

    await db('order_detail').insert(orderDetails)

    // update order total_amount
    await db(tableName).update({ total_amount: amount })
    return { order_id, amount }
  },

  async checkout(parent, args, context) {
    const { fullname, address, city, state, country, zip } = args
    const { order_id, amount } = await this.create(parent, args, context)

    const stripe = Stripe(process.env.STRIPE_KEY)

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        // convert dollars into cents
        amount: Math.round(amount * 100),
        currency: 'usd',
        description: 'Turing fullstack challenge',
        metadata: {
          order_id,
          fullname,
          address,
          city,
          state,
          country,
          zip,
        },
      })

      return paymentIntent.client_secret
    } catch (err) {
      context.koaCtx.response.status = 400
      throw err
    }
  },
}
