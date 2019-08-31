/* eslint-disable camelcase */
const { paginate } = require('../utils')
const { fieldsToColumns } = require('../utils')

async function getPriceBetween(inPrice, db) {
  const { max, min } = await getPriceRange(db)

  if (inPrice.length >= 2) return [inPrice[0], inPrice[1]].sort()

  return [min, max]
}

function getPriceRange(db) {
  return db
    .max({ max: 'price' })
    .min({ min: 'price' })
    .from('product')
    .then(rows => rows[0])
}

module.exports = {
  priceRange(parent, args, { db }) {
    return getPriceRange(db)
  },

  async all(parent, args, { db }, info) {
    const { inCategory, inColor, inSize, inPrice, sortBy, page, perPage } = args

    const mandatoryFields = ['p.product_id']
    const outsiderFields = ['__typename', 'product_id', 'colors', 'sizes']

    const columns = new Set(
      fieldsToColumns(info, 'data', outsiderFields).concat(mandatoryFields),
    )

    let query = db.table('product as p')

    // filter by given category
    if (inCategory && inCategory.length) {
      query = query
        .innerJoin('product_category as pc', 'p.product_id', 'pc.product_id')
        .whereIn('pc.category_id', inCategory)
    }

    // join color and size ids into a single array,
    // because in general, they are just attributes
    const attributes = []
      .concat(inColor)
      .concat(inSize)
      .filter(Boolean)

    // filter by given color and size
    if (attributes.length) {
      query = query
        .innerJoin('product_attribute as pa', 'pa.product_id', 'p.product_id')
        .whereIn('pa.attribute_value_id', attributes)
    }

    // filter by given price range
    // including discounted price
    if (inPrice && inPrice.length) {
      const priceBetween = await getPriceBetween(inPrice, db)
      query = query.whereBetween('p.price', priceBetween)
    }

    // select only given columns
    query = query.select([...columns])

    const { total } = (await query
      .clone()
      .countDistinct('p.product_id as total'))[0]

    // sort by given field
    if (sortBy) query = query.orderBy(sortBy)

    // Don't allow negative pages
    let currentPage = page
    if (currentPage < 1) {
      currentPage = 1
    }

    const offset = (currentPage - 1) * perPage

    const result = await query
      .clone()
      .groupBy('p.product_id')
      .select([...columns])
      .limit(perPage)
      .offset(offset)

    return {
      metadata: paginate(total, page, perPage),
      data: result,
    }
  },

  colors({ product_id }, args, { loaders }) {
    return loaders.product.colors.load(product_id)
  },

  sizes({ product_id }, args, { loaders }) {
    return loaders.product.sizes.load(product_id)
  },

  categories({ product_id }, args, { loaders }) {
    return loaders.product.categories.load(product_id)
  },

  find(parent, { product_id }, { loaders }) {
    return loaders.query.product.load(product_id)
  },
}
