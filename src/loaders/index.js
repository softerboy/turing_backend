const DataLoader = require('dataloader')
const department = require('./department')
const db = require('../db')

module.exports = {
  department: department(db, DataLoader),
}
