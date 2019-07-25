const { UserInputError } = require('apollo-server-koa')
const Schema = require('async-validator')

module.exports = {
  validateRegisterForm(customer) {
    const err = (message, code, field, status = 400) =>
      new UserInputError(message, { code, field, status })

    const descriptor = {
      // a name field rules
      name: [
        {
          required: true,
          message: err('The name is required', 'USR_02', 'name'),
        },
        {
          min: 3,
          message: err('Name is too short', 'USR_07', 'name'),
        },
        {
          max: 50,
          message: err('Name is too long', 'USR_07', 'name'),
        },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9]*(?:\s+[a-zA-Z][a-zA-Z0-9]+)?$/,
          message: err(
            /* eslint-disable */
            'Name must contain only alphanumeric characters ' +
              "and shouldn't begin with a digit and shouldn't contain special characters",
            'USR_07',
            'name',
            /* eslint-enable */
          ),
        },
      ],

      // an email field rules
      email: [
        {
          required: true,
          message: err('The email is required', 'USR_02', 'email'),
        },
        {
          type: 'email',
          message: err('Invalid email', 'USR_07', 'email'),
        },
        {
          max: 100,
          message: err('Email is too long', 'USR_07', 'email'),
        },
      ],

      // a password field rules
      password: [
        {
          required: true,
          message: err('The password is required', 'USR_02', 'password'),
        },
        {
          pattern: /(?=.*[a-z])/,
          message: err(
            'The password must contain at least 1 lowercase alphabetical character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /(?=.*[A-Z])/,
          message: err(
            'The password must contain at least 1 uppercase alphabetical character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /(?=.*[0-9])/,
          message: err(
            'The password must contain at least 1 numeric character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /(?=.[!@#$%^&])/,
          message: err(
            'The password must contain at least 1 special character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /^.{6,50}$/,
          message: err(
            'The password length must be between 6 and 50 characters long',
            'USR_07',
            'password',
          ),
        },
      ],
    }

    return new Schema(descriptor).validate(customer)
  },
}
