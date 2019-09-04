function loadCart(db, DataLoader, buyNow = true) {
  return new DataLoader(ids => {
    const cols = [
      'sc.item_id',
      'sc.cart_id',
      'sc.attributes',
      'sc.product_id',
      'sc.quantity',
      'p.name',
      'p.image',
      db.raw('COALESCE(NULLIF(p.discounted_price, 0), p.price) AS price'),
      db.raw(
        'COALESCE(NULLIF(p.discounted_price, 0), p.price) * sc.quantity AS subtotal',
      ),
    ]

    return db
      .select(cols)
      .from('shopping_cart as sc')
      .innerJoin('product as p', 'p.product_id', 'sc.product_id')
      .whereIn('sc.cart_id', ids)
      .andWhere('sc.buy_now', buyNow)
      .then(carts => ids.map(id => carts.filter(cart => cart.cart_id === id)))
  })
}

module.exports = (db, DataLoader) => ({
  product: new DataLoader(ids =>
    db
      .select()
      .from('product')
      .where('product_id', ids[0]),
  ),

  cart: loadCart(db, DataLoader, true),
  savedCart: loadCart(db, DataLoader, false),
})
