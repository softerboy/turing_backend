const DataLoader = require('dataloader')
const db = require('../db')

module.exports = {
  department: require('./department')(db, DataLoader),
  product: require('./product')(db, DataLoader),
  query: require('./query')(db, DataLoader),
  review: require('./review')(db, DataLoader),
  shippingRegion: require('./shipping-region')(db, DataLoader),
}
