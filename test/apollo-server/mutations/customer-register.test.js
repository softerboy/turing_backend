require('dotenv-flow').config()
const { tester: Tester } = require('graphql-tester')
const db = require('../../../src/db')

if (process.env.NODE_ENV !== 'test')
  throw new Error(
    `Please run this tests with NODE_ENV=test environment variable,
     otherwise, your production schema may be lost`,
  )

describe('Customer mutation', () => {
  beforeAll(() => {
    return db.migrate.down().then(() => db.migrate.latest())
  })

  const tester = Tester({
    url: `http://localhost:${process.env.PORT}/graphql`,
    contentType: 'application/json',
  })

  const query = `
    mutation CustomerRegister(
      $name: String!
      $email: String!
      $password: String!
    ) {
      customerRegister(name: $name, email: $email, password: $password) {
        name
        email
        accessToken
      }
    }
  `

  const variables = {
    name: 'jane',
    email: 'jane@doe.com',
    password: 'PUtS@cr3Hree',
  }

  it('should return HTTP 200 code and customer details after register', async () => {
    const response = await tester(JSON.stringify({ query, variables }))
    expect(response.status).toBe(200)

    const { accessToken, name, email } = response.data.customerRegister
    expect(name).toBe(variables.name)
    expect(email).toBe(variables.email)
    expect(accessToken.length).toBeGreaterThan(10)
  })

  it('should throw for existing customer with same email', async () => {
    const response = await tester(JSON.stringify({ query, variables }))
    expect(response.status).toBe(400)

    const { code } = response.errors[0].extensions.exception.errors[0]
    expect(code).toBe('USR_04')
  })

  afterAll(() => db.destroy())
})
