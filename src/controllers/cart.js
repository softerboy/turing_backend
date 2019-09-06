/* eslint-disable camelcase */
const { ValidationError } = require('apollo-server-koa')
const shortid = require('shortid')

const tableName = 'shopping_cart'

function clearCartLoader(loaders, cart_id) {
  const { cart, savedCart } = loaders.query
  cart.clear(cart_id)
  savedCart.clear(cart_id)
}

function cartByItemId(db, item_id) {
  return db
    .first()
    .from(tableName)
    .where({ item_id })
}

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
      await db(tableName)
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

      await db(tableName).insert(newCart)
    }

    // clear/unmemoize cart loader cache for given cart id
    // because cart data updated
    loaders.query.cart.clear(cart_id)

    return loaders.query.cart.load(cart_id)
  },

  async get(parent, { cart_id }, { loaders }) {
    return loaders.query.cart.load(cart_id)
  },

  async update(parent, args, context) {
    const { quantity, item_id } = args
    const { loaders, db } = context

    const dbCart = await cartByItemId(db, item_id)

    if (quantity > 0) {
      await db(tableName)
        .update({ quantity })
        .where({ item_id })

      // update loader cache
      clearCartLoader(loaders, dbCart.cart_id)

      // return updated cart products
      return loaders.query.cart.load(dbCart.cart_id)
    }

    return this.removeItem(parent, args, context)
  },

  async removeItem(parent, { item_id }, { db, loaders }) {
    // save cart_id before removal
    const { cart_id } = await cartByItemId(db, item_id)

    // remove cart item with given item_id
    await db(tableName)
      .where({ item_id })
      .del()

    // update/unmemoize loaders cache
    clearCartLoader(loaders, cart_id)

    return loaders.query.cart.load(cart_id)
  },

  async empty(parent, { cart_id }, { db, loaders }) {
    // clear/unmemoize cart loader cache
    clearCartLoader(loaders, cart_id)

    // delete shopping cart
    await db(tableName)
      .where({ cart_id })
      .del()

    // return an empty array
    return []
  },

  async moveToCart(parent, { item_id }, { db, loaders }) {
    // update shopping cart first
    await db(tableName)
      .update({
        buy_now: true,
        added_on: db.fn.now(),
      })
      .where({ item_id })

    // receive cart id
    const { cart_id } = await cartByItemId(db, item_id)

    // clear/unmemoize loader cache
    clearCartLoader(loaders, cart_id)

    return loaders.query.cart.load(cart_id)
  },

  async saveForLater(parent, { item_id }, { db, loaders }) {
    await db(tableName)
      .update({
        buy_now: false,
        quantity: 1,
      })
      .where({ item_id })

    // receive cart id
    const { cart_id } = await cartByItemId(db, item_id)

    // clear/unmemoize loader cache
    clearCartLoader(loaders, cart_id)

    return loaders.query.cart.load(cart_id)
  },

  async getSaved(parent, { cart_id }, { loaders }) {
    return loaders.query.savedCart.load(cart_id)
  },

  async totalAmount(parent, { cart_id }, { db }) {
    const sumCol =
      'SUM(COALESCE(NULLIF(p.discounted_price, 0), p.price) * sc.quantity) AS total_amount'

    const { total_amount } = await db
      .first([db.raw(sumCol)])
      .from(`${tableName} as sc`)
      .innerJoin('product as p', 'sc.product_id', 'p.product_id')
      .where('sc.cart_id', cart_id)
      .andWhere('sc.buy_now', true)

    return Number(total_amount)
  },
}
