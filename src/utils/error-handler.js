const {
  ValidationError,
  ApolloError,
  AuthenticationError,
  UserInputError,
} = require('apollo-server-koa')

module.exports = {
  handleError(err) {
    // error comes from form validation
    if (err instanceof ValidationError) {
      throw new UserInputError('Invalid email or password', {
        errors: err.errors,
      })
    }

    // invalid credentials provided
    else if (err instanceof AuthenticationError) {
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

    // duplicate email at registering user
    else if (err instanceof Error && err.code === 'ER_DUP_ENTRY') {
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

    // other error
    // just rethrow it
    throw err
  },
}
