/* eslint-disable camelcase */
const {
  UserInputError,
  ApolloError,
  AuthenticationError,
  ValidationError,
} = require('apollo-server-koa')

const { fieldsToColumns, createToken, md5 } = require('../utils')
const {
  validateRegisterForm,
  validateLoginForm,
} = require('../validators/customer')

const generateAccessToken = customer_id => {
  const expires_in = process.env.JWT_EXPIRES_IN

  const accessToken = createToken({ customer_id }, null, expires_in)
  return { expires_in, accessToken }
}

module.exports = {
  async add(parent, customer, { db, koaCtx }, info) {
    try {
      const tableName = 'customer'

      // 1) validate customer input
      // if validation fails, an exception
      // will be thrown
      await validateRegisterForm(customer)

      // hash user password before save
      customer.password = md5(customer.password)

      // 2) insert customer into database
      // if email already exists, an exception
      // will be thrown with code ER_DUP_ENTRY
      await db(tableName).insert(customer)

      // 2) get just saved customer entry
      // select just an asked columns
      // delete accessToken, expires_in and __typename fields
      // because they doesn't exists in database table
      let columns = fieldsToColumns(info, undefined, [
        '__typename',
        'accessToken',
        'expires_in',
      ])

      // anyway include customer_id column,
      // it used as payload in jwt token
      columns = Array.from(new Set(columns.concat(['customer_id'])))

      // 3) generate a jwt access token
      const savedCustomer = await db.first(columns).from(tableName)
      const { customer_id } = savedCustomer
      const { expires_in, accessToken } = generateAccessToken(customer_id)

      return {
        ...savedCustomer,
        accessToken,
        expires_in,
      }
    } catch (err) {
      // set status code to BAD_REQUEST
      koaCtx.response.status = 400

      /* eslint-disable prettier/prettier, no-prototype-builtins */
      if (err instanceof ValidationError) {
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

  async login(parent, { email, password }, { db, koaCtx }, info) {
    try {
      // 1) validate login form
      // if validation fails, an exception
      // will be thrown
      await validateLoginForm({ email, password })

      let columns = fieldsToColumns(info, undefined, [
        '__typename',
        'accessToken',
        'expires_in',
      ])

      // anyway include 'password' and 'customer_id' columns,
      // they are used for comparing form's password and
      // signing jwt token
      columns = Array.from(new Set(columns.concat(['password', 'customer_id'])))

      // 2) find user by email
      const dbCustomer = await db
        .first(columns)
        .where({ email })
        .from('customer')

      if (dbCustomer) {
        // customer by given email found
        // check, are passwords match?
        const hash = md5(password)
        if (hash === dbCustomer.password) {
          const { customer_id } = dbCustomer
          const { expires_in, accessToken } = generateAccessToken(customer_id)

          return {
            ...dbCustomer,
            expires_in,
            accessToken,
          }
        } else {
          // passwords don't match, reject
          throw new AuthenticationError('Email or Password is invalid')
        }
      } else {
        // user not found by given email, reject!
        throw new AuthenticationError('Email or Password is invalid')
      }
    } catch (err) {
      koaCtx.response.status = 400

      if (err instanceof ValidationError) {
        throw new UserInputError('Invalid email or password', {
          errors: err.errors,
        })
      } else if (err instanceof AuthenticationError) {
        const errors = [
          {
            code: 'USR_01',
            message: 'Email or Password is invalid',
            field: 'email',
            status: 400,
          },
        ]
        throw new ApolloError('Email or Password is invalid', 'USR_01', {
          errors,
        })
      }

      // rethrow error
      throw err
    }
  },
}
