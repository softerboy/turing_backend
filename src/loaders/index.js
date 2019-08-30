const DataLoader = require('dataloader')
const db = require('../db')

module.exports = {
  department: require('./department')(db, DataLoader),
  product: require('./product')(db, DataLoader),
}
