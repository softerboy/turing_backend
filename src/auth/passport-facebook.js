const FacebookTokenStrategy = require('passport-facebook-token')
const koaPassport = require('koa-passport')

const authenticate = require('./passport-social')

const options = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}

module.exports = authenticate(
  koaPassport,
  FacebookTokenStrategy,
  options,
  'facebook-token',
)
