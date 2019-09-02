const crypto = require('crypto')
const graphqlFields = require('graphql-fields')
const get = require('lodash.get')
const jwt = require('jsonwebtoken')

module.exports = {
  /**
   * Maps asked graphql fields to sql table column names.
   * Then it's easy to use it in SQL's select statement
   *
   * @param  info
   * @param {string} prop inner field for parsing. You can use dot notation for getting inner property
   * @param {string[]} exclude array of fields for exclude
   * @return {string[]} an array of columns for using sql's select statement.
   */
  fieldsToColumns(info, prop = undefined, exclude = []) {
    const fields = graphqlFields(info)

    let result = fields
    if (prop) {
      result = get(fields, prop)
    }

    return Object.keys(result).filter(key => !exclude.includes(key))
  },

  createToken(payload, secret, expiresIn) {
    if (!secret) secret = process.env.JWT_SECRET
    if (!expiresIn) expiresIn = process.env.JWT_EXPIRES_IN
    return jwt.sign(payload, secret, { expiresIn })
  },

  md5(str) {
    return crypto
      .createHash('md5')
      .update(str)
      .digest('hex')
  },

  paginate(totalItems, currentPage = 1, pageSize = 10, maxPages = 10) {
    // calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize)

    // ensure current page isn't out of range
    if (currentPage < 1) {
      currentPage = 1
    } else if (currentPage > totalPages) {
      currentPage = totalPages
    }

    let startPage, endPage
    if (totalPages <= maxPages) {
      // total pages less than max so show all pages
      startPage = 1
      endPage = totalPages
    } else {
      // total pages more than max so calculate start and end pages
      const maxPagesBeforeCurrentPage = Math.floor(maxPages / 2)
      const maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1
      if (currentPage <= maxPagesBeforeCurrentPage) {
        // current page near the start
        startPage = 1
        endPage = maxPages
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        // current page near the end
        startPage = totalPages - maxPages + 1
        endPage = totalPages
      } else {
        // current page somewhere in the middle
        startPage = currentPage - maxPagesBeforeCurrentPage
        endPage = currentPage + maxPagesAfterCurrentPage
      }
    }

    // calculate start and end item indexes
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)

    // create an array of pages
    const pages = Array.from(Array(endPage + 1 - startPage).keys()).map(
      i => startPage + i,
    )

    // return object with all pager properties required by the view
    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages,
    }
  },

  atob(data) {
    return Buffer.from(data, 'base64').toString()
  },

  btoa(str) {
    return Buffer.from(str).toString('base64')
  },
}
