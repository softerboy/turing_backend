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

  async update(parent, args, context) {
    const { quantity, item_id } = args
    const { loaders, db } = context

    const dbCart = await db
      .first()
      .from('shopping_cart')
      .where({ item_id })

    if (quantity > 0) {
      await db('shopping_cart')
        .update({ quantity })
        .where({ item_id })

      // update loader cache
      const cartLoader = loaders.query.cart
      cartLoader.clear(dbCart.cart_id)

      // return updated cart products
      return cartLoader.load(dbCart.cart_id)
    }

    return this.removeItem(parent, args, context)
  },

  async removeItem(parent, { item_id }, { db, loaders }) {
    // save cart_id before removal
    const { cart_id } = await db
      .first()
      .from('shopping_cart')
      .where({ item_id })

    // remove cart item with given item_id
    await db('shopping_cart')
      .where({ item_id })
      .del()

    // update/unmemoize loaders cache
    const cartLoader = loaders.query.cart
    cartLoader.clear(cart_id)

    return cartLoader.load(cart_id)
  },

  async empty(parent, { cart_id }, { db, loaders }) {
    // clear/unmemoize cart loader cache
    loaders.query.cart.clear(cart_id)

    // delete shopping cart
    await db('shopping_cart')
      .where({ cart_id })
      .del()

    // return an empty array
    return []
  },
}
