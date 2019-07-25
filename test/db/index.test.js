require('dotenv-flow').config()
const db = require('../../src/db')

afterAll(() => db.destroy())

describe('Database', () => {
  it('should connect successfully', () => {
    return expect(db.first('product_id').from('product')).resolves.toEqual({
      product_id: 1,
    })
  })
})
