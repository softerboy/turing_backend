const { fieldsToColumns } = require('../utils')

module.exports = {
  all(parent, args, { db }, info) {
    // fields used by data loader for solving
    // child/sub fields N+1 problem
    const mandatoryFields = ['department_id']
    const outsiderFields = ['__typename', 'categories']

    const columns = new Set(
      fieldsToColumns(info, undefined, outsiderFields).concat(mandatoryFields),
    )
    return db.select([...columns]).from('department')
  },
}
