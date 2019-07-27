const { UserInputError } = require('apollo-server-koa')

const { fieldsToColumns } = require('../utils')
const { validateRegisterForm } = require('../validators/customer')

module.exports = {
  async add(parent, customer, { db }, info) {
    try {
      const tableName = 'customer'

      // 1) validate customer input
      // if validation fails, an exception
      // will be thrown
      await validateRegisterForm(customer)

      // 2) insert customer into database
      // if email already exists, an exception
      // will be thrown with code ER_DUP_ENTRY
      await db(tableName).insert(customer)

      // 2) get just saved customer entry
      // select just an asked columns
      // delete accessToken, expires_in and __typename fields
      // because they doesn't exists in database table
      const columns = fieldsToColumns(info, undefined, [
        '__typename',
        'accessToken',
        'expires_in',
      ])

      const savedCustomer = await db.first(columns).from(tableName)

      return {
        ...savedCustomer,
        accessToken: 'access_token',
        expires_in: '24h',
      }
    } catch (err) {
      /* eslint-disable prettier/prettier, no-prototype-builtins */
      if (err instanceof Object && err.hasOwnProperty('errors')) {
        // this is a async validator error object
        throw new UserInputError('Invalid arguments', {
          errors: err.errors,
        })
      } else if (err instanceof Error && err.code === 'ER_DUP_ENTRY') {
        // handle duplicate email entry
        const errors = [
          {
            code: 'USR_04',
            message: 'Email already exists',
            field: 'email',
            status: 400,
          },
        ]

        throw new UserInputError('Email already exists', {
          errors,
        })
      }

      // just rethrow error
      throw err
    }
  },
}
