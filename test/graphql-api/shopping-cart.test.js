/* eslint-disable camelcase */
require('dotenv-flow').config()
const { tester: Tester } = require('graphql-tester')

const db = require('../../src/db')

let cart_id = null
const attributes = 'Red, XL'
let product = null
let item_id = null

function getProductPrice(product) {
  return product.discounted_price || product.price
}

const tester = Tester({
  url: `http://localhost:${process.env.PORT}/graphql`,
  contentType: 'application/json',
})

function addProductToCart(cart_id, product_id, attributes) {
  const ADD_TO_CART_MUTATION = `
      mutation AddToCart($cart_id: String!, $product_id: Int!, $attributes: String!) {
        addToCart(cart_id: $cart_id, product_id: $product_id, attributes: $attributes) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

  return tester(
    JSON.stringify({
      query: ADD_TO_CART_MUTATION,
      variables: { cart_id, product_id, attributes },
    }),
  )
}

beforeAll(async () => {
  product = await db
    .first()
    .from('product')
    .orderByRaw('RAND()')
})

describe('Cart', function() {
  // ================ Test generating unique id ====================
  it('should generate valid cart id', async () => {
    const SHOPPING_CART_ID_QUERY = `
      query ShoppingCartIdQuery {
        generateUniqueCartId
      }
    `

    const response = await tester(
      JSON.stringify({ query: SHOPPING_CART_ID_QUERY }),
    )

    expect(response.status).toBe(200)
    cart_id = response.data.generateUniqueCartId
    expect(typeof cart_id).toBe('string')
    expect(cart_id.length).toBeGreaterThan(3)
  })
  // =================================================================

  // ==================== Testing add to cart ========================
  it('should add product to cart', async () => {
    const { product_id, name } = product
    const response = await addProductToCart(cart_id, product_id, attributes)

    expect(response.status).toBe(200)

    const { addToCart } = response.data
    expect(addToCart).toBeInstanceOf(Array)

    const [cart] = addToCart
    expect(cart.quantity).toBe(1)
    expect(cart.attributes).toBe(attributes)
    expect(cart.name).toBe(name)
    expect(cart.product_id).toBe(product_id)
  })
  // =================================================================

  // ==================== Testing get product list ========================
  it('should return cart product list', async () => {
    // increase cart quantity count
    const { product_id, name } = product
    await addProductToCart(cart_id, product_id, attributes)

    const GET_CART_QUERY = `
      query GetCart($cart_id: String!) {
        cart(cart_id: $cart_id) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

    const response = await tester(
      JSON.stringify({ query: GET_CART_QUERY, variables: { cart_id } }),
    )

    expect(response.status).toBe(200)

    const { cart } = response.data
    expect(cart).toBeInstanceOf(Array)

    const [item] = cart
    // remember we increased cart quantity
    expect(item.quantity).toBe(2)
    expect(item.attributes).toBe(attributes)
    expect(item.name).toBe(name)
    expect(item.product_id).toBe(product_id)

    // used in next tests
    item_id = item.item_id
  })
  // =================================================================

  // ==================== Testing update quantity ========================
  it('should update cart product quantity', async () => {
    const UPDATE_CART_MUTATION = `
      mutation UpdateCart($item_id: Int!, $quantity: Int!) {
        updateCart(item_id: $item_id, quantity: $quantity) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

    const quantity = 12
    const response = await tester(
      JSON.stringify({
        query: UPDATE_CART_MUTATION,
        variables: { item_id, quantity },
      }),
    )

    expect(response.status).toBe(200)

    const { updateCart: cart } = response.data
    expect(cart).toBeInstanceOf(Array)

    const { name, product_id } = product
    const [item] = cart
    // remember we increased cart quantity
    expect(item.quantity).toBe(quantity)
    expect(item.attributes).toBe(attributes)
    expect(item.name).toBe(name)
    expect(item.product_id).toBe(product_id)
  })
  // =================================================================

  // ==================== Testing save for later =====================
  it('should save product for later', async () => {
    const SAVE_FOR_LATER_MUTATION = `
      mutation SaveForLater($item_id: Int!) {
        saveForLater(item_id: $item_id) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

    const response = await tester(
      JSON.stringify({
        query: SAVE_FOR_LATER_MUTATION,
        variables: { item_id },
      }),
    )

    expect(response.status).toBe(200)

    const { saveForLater: cart } = response.data
    expect(cart).toBeInstanceOf(Array)
    expect(cart.length).toBe(0)
  })
  // =================================================================

  // ================ Testing saved for later cart items =============
  it('should return saved cart product list', async () => {
    const { product_id, name } = product

    const GET_SAVED_CART_QUERY = `
      query GetSavedCart($cart_id: String!) {
        getSaved(cart_id: $cart_id) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

    const response = await tester(
      JSON.stringify({ query: GET_SAVED_CART_QUERY, variables: { cart_id } }),
    )

    expect(response.status).toBe(200)

    const { getSaved: cart } = response.data
    expect(cart).toBeInstanceOf(Array)

    const [item] = cart
    // remember we increased cart quantity
    expect(item.quantity).toBe(1)
    expect(item.attributes).toBe(attributes)
    expect(item.name).toBe(name)
    expect(item.product_id).toBe(product_id)
  })
  // =================================================================

  // ================ Testing saved for later cart items =============
  it('should move product from saved cart into actual cart', async () => {
    const { product_id, name } = product

    // increase cart quantity count
    const MOVE_TO_CART_MUTATION = `
      mutation MoveToCart($item_id: Int!) {
        moveToCart(item_id: $item_id) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

    const response = await tester(
      JSON.stringify({ query: MOVE_TO_CART_MUTATION, variables: { item_id } }),
    )

    expect(response.status).toBe(200)

    const { moveToCart: cart } = response.data
    expect(cart).toBeInstanceOf(Array)

    const [item] = cart
    // remember we increased cart quantity
    expect(item.quantity).toBe(1)
    expect(item.attributes).toBe(attributes)
    expect(item.name).toBe(name)
    expect(item.product_id).toBe(product_id)
  })
  // =================================================================

  // ================ Testing remove product from cart ===============
  it('should remove product from cart', async () => {
    // increase cart quantity count
    const REMOVE_FROM_CART_MUTATION = `
      mutation RemoveFromCart($item_id: Int!) {
        removeItem(item_id: $item_id) {
          item_id
          name
          attributes
          product_id
          price
          quantity
        }
      }
    `

    const response = await tester(
      JSON.stringify({
        query: REMOVE_FROM_CART_MUTATION,
        variables: { item_id },
      }),
    )

    expect(response.status).toBe(200)

    const { removeItem: cart } = response.data
    expect(cart).toBeInstanceOf(Array)

    // after remove length should be 0
    // because in our test cart contains only
    // one type of product
    expect(cart.length).toBe(0)
  })
  // =================================================================

  // ================ Testing total amount of cart ===================
  it('should return total amount of cart', async () => {
    // add same product above to cart twice
    await addProductToCart(cart_id, product.product_id, attributes)
    await addProductToCart(cart_id, product.product_id, attributes)
    const expected = 2 * getProductPrice(product)

    // increase cart quantity count
    const CART_TOTAL_AMOUNT_QUERY = `
      query CartTotalAmount($cart_id: String!) {
        totalAmount(cart_id: $cart_id)
      }
    `

    const response = await tester(
      JSON.stringify({
        query: CART_TOTAL_AMOUNT_QUERY,
        variables: { cart_id },
      }),
    )

    expect(response.status).toBe(200)
    const { totalAmount } = response.data
    expect(totalAmount).toBe(expected)
  })
  // =================================================================

  // ================ Testing total amount of cart ===================
  it('should remove/clear cart data', async () => {
    // add same product above to cart twice
    await addProductToCart(cart_id, product.product_id, attributes)
    await addProductToCart(cart_id, product.product_id, attributes)

    // increase cart quantity count
    const EMPTY_CART_QUERY = `
      mutation EmptyCart($cart_id: String!) {
        emptyCart(cart_id: $cart_id) {
          name
        }
      }
    `

    const response = await tester(
      JSON.stringify({
        query: EMPTY_CART_QUERY,
        variables: { cart_id },
      }),
    )

    expect(response.status).toBe(200)

    const { emptyCart: cart } = response.data
    expect(cart).toBeInstanceOf(Array)
    expect(cart.length).toBe(0)
  })
  // =================================================================
})

afterAll(() =>
  db('shopping_cart')
    .where({ cart_id })
    .del()
    .then(() => db.destroy()),
)
