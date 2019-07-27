require('dotenv-flow').config()
const db = require('../../src/db')

afterAll(() => db.destroy())

describe('Database', () => {
  it('should connect successfully', async () => {
    const { result } = (await db.raw('select 1 + 1 as result'))[0][0]
    expect(result).toBe(2)
  })
})
