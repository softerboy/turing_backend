const shortid = require('shortid')

module.exports = {
  generateUniqueId() {
    return shortid.generate()
  },
}
