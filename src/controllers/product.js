/* eslint-disable camelcase */
const { ApolloError } = require('apollo-server-koa')

const { validateReviewForm } = require('../validators/review')
const { paginate, btoa, atob } = require('../utils')
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
    const {
      inCategory,
      inColor,
      inSize,
      inPrice,
      sortBy,
      page,
      perPage,
      search,
    } = args

    const mandatoryFields = ['p.product_id']
    const outsiderFields = ['__typename', 'product_id', 'colors', 'sizes']

    const columns = new Set(
      fieldsToColumns(info, 'data', outsiderFields).concat(mandatoryFields),
    )

    let query = db.table('product as p')

    if (search && search.length) {
      query.whereRaw(
        'MATCH (p.name, p.description) AGAINST (? IN BOOLEAN MODE)',
        [search],
      )
    }

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

  find(parent, { product_id }, { loaders, koaCtx }) {
    return loaders.query.product.load(product_id).catch(error => {
      koaCtx.response.status = 404
      throw error
    })
  },

  async addReview(parent, review, { db, koaCtx }) {
    const { customer } = koaCtx

    // check user is authorized
    if (!customer) {
      throw new ApolloError('You are not authorized!!!', 'USR_01')
    }

    // if validation fails, an exception will be thrown
    await validateReviewForm(review)

    const tableName = 'review'
    // insert new review
    await db(tableName).insert({
      ...review,
      customer_id: customer.customer_id,
      created_on: db.fn.now(),
    })

    // prettier-ignore
    const res = await db.raw(`SELECT LAST_INSERT_ID() as review_id FROM ${tableName}`)
    const { review_id } = res[0][0]

    return db
      .first()
      .from(tableName)
      .where({ review_id })
  },

  async reviews({ product_id }, args, { db }) {
    const query = db
      .select()
      .from('review')
      .where('product_id', product_id)

    const perPage = 10
    const { cursor, count = perPage } = args

    // limit is equal to count plus one.
    // By setting the limit to one more
    // than the count requested by the client,
    // we’ll know we’re at the last page when the
    // number of rows returned is less than count.
    // At that point, we’ll return an empty next_cursor
    // which tells the client there are no more pages to be fetched
    const limit = count < 0 ? perPage + 1 : count + 1

    if (cursor) query.andWhere('review_id', '<=', atob(cursor))

    const data = await query.limit(limit).orderBy('created_on', 'desc')
    let next_cursor = null
    if (data.length === limit) {
      const lastItem = data.pop()
      next_cursor = btoa(String(lastItem.review_id))
    }

    return {
      data,
      next_cursor,
    }
  },
}
