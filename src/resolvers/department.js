/* eslint-disable camelcase */
module.exports = {
  categories({ department_id }, args, { loaders }) {
    return loaders.department.categories.load(department_id)
  },
}
