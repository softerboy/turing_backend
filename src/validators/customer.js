const Schema = require('async-validator')

const { errorBuilder, errorWrapper } = require('../utils/error-handler')

const email = [
  {
    required: true,
    message: errorBuilder('The email is required', 'USR_02', 'email'),
  },
  {
    type: 'email',
    message: errorBuilder('Invalid email', 'USR_07', 'email'),
  },
  {
    max: 100,
    message: errorBuilder('Email is too long', 'USR_07', 'email'),
  },
]

module.exports = {
  validateRegisterForm(registerForm) {
    const descriptor = {
      // a name field rules
      name: [
        {
          required: true,
          message: errorBuilder('The name is required', 'USR_02', 'name'),
        },
        {
          min: 3,
          message: errorBuilder('Name is too short', 'USR_07', 'name'),
        },
        {
          max: 50,
          message: errorBuilder('Name is too long', 'USR_07', 'name'),
        },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9]*(?:\s+[a-zA-Z][a-zA-Z0-9]+)?$/,
          message: errorBuilder(
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
      email,

      // a password field rules
      password: [
        {
          required: true,
          message: errorBuilder(
            'The password is required',
            'USR_02',
            'password',
          ),
        },
        {
          pattern: /(?=.*[a-z])/,
          message: errorBuilder(
            'The password must contain at least 1 lowercase alphabetical character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /(?=.*[A-Z])/,
          message: errorBuilder(
            'The password must contain at least 1 uppercase alphabetical character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /(?=.*[0-9])/,
          message: errorBuilder(
            'The password must contain at least 1 numeric character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /(?=.[!@#$%^&])/,
          message: errorBuilder(
            'The password must contain at least 1 special character',
            'USR_07',
            'password',
          ),
        },
        {
          pattern: /^.{6,50}$/,
          message: errorBuilder(
            'The password length must be between 6 and 50 characters long',
            'USR_07',
            'password',
          ),
        },
      ],
    }

    return new Schema(descriptor).validate(registerForm).catch(err => {
      throw errorWrapper(err)
    })
  },

  validateLoginForm(loginForm) {
    const descriptor = {
      email: email,

      // the required rule is enough
      // to validating password here
      password: {
        required: true,
        message: errorBuilder('The password is required', 'USR_02', 'password'),
      },
    }

    return new Schema(descriptor).validate(loginForm).catch(err => {
      throw errorWrapper(err)
    })
  },
}
