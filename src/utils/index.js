const graphqlFields = require('graphql-fields')
const get = require('lodash.get')

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
}
