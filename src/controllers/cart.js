/* eslint-disable camelcase */
const { ValidationError } = require('apollo-server-koa')
const shortid = require('shortid')

module.exports = {
  generateUniqueId() {
    return shortid.generate()
  },

  async add(parent, args, { db, koaCtx, loaders }) {
    // all type validations done in graphql side
    const { cart_id, product_id, attributes } = args

    // check, is product exists by given product id
    // if product not found an exception will be thrown
    try {
      await loaders.query.product.load(product_id)
    } catch (e) {
      if (e instanceof TypeError) {
        koaCtx.response.status = 404 // NOT_FOUND
        throw new ValidationError(`Can't find product by id ${product_id}`)
      }
    }

    // create new shopping cart record,
    // or increase quantity of existing record
    const cart = await db
      .first()
      .from('shopping_cart')
      .where({ cart_id, product_id, attributes })

    // cart found!
    // update quantity
    if (cart) {
      await db('shopping_cart')
        .update({
          quantity: cart.quantity + 1,
          buy_now: true,
        })
        .where(cart)
    } else {
      const newCart = {
        cart_id,
        product_id,
        attributes,
        quantity: 1,
        buy_now: true,
        added_on: db.fn.now(),
      }

      await db('shopping_cart').insert(newCart)
    }

    // clear/unmemoize cart loader cache for given cart id
    // because cart data updated
    await loaders.query.cart.clear(cart_id)

    return loaders.query.cart.load(cart_id)
  },

  async get(parent, { cart_id }, { loaders }) {
    return loaders.query.cart.load(cart_id)
  },
}
