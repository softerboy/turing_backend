const { Strategy: GoogleTokenStrategy } = require('passport-google-token')
const koaPassport = require('koa-passport')
const authenticate = require('./passport-social')

const options = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}

module.exports = authenticate(
  koaPassport,
  GoogleTokenStrategy,
  options,
  'google-token',
)
