const { Strategy } = require('passport-jwt')
const koaPassport = require('koa-passport')

const db = require('../db')

const extractor = request => {
  // koa uses lowercase header names
  if (request.headers && request.headers['user-key']) {
    return request.headers['user-key'].replace('Bearer ', '')
  }

  return null
}

const options = {
  jwtFromRequest: extractor,
  secretOrKey: process.env.JWT_SECRET,
}

/* eslint-disable camelcase */
const strategy = new Strategy(options, async ({ customer_id }, done) => {
  // try to find user from payload's customer_id and email
  const tableName = 'customer'
  const user = await db
    .first()
    .where({ customer_id })
    .from(tableName)

  if (user) {
    done(null, user)
  } else {
    done(null, false)
  }
})

koaPassport.use(strategy)

const jwtMiddleware = async (ctx, next) => {
  await koaPassport.authenticate(
    // authentication strategy
    'jwt',
    // authentication handler callback
    // eslint-disable-next-line
    (err, user) => {
      if (user) ctx.customer = user
      return next()
    },
  )(ctx, next)
}

module.exports = jwtMiddleware
