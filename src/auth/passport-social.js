module.exports = function(koaPassport, Strategy, options, name) {
  function TokenStrategyCallback(accessToken, refreshToken, profile, done) {
    done(null, {
      accessToken,
      refreshToken,
      profile,
    })
  }

  /* eslint-disable camelcase */
  const strategy = new Strategy(options, TokenStrategyCallback)

  koaPassport.use(strategy)

  return ctx =>
    new Promise((resolve, reject) => {
      koaPassport.authenticate(name, (err, data, info) => {
        if (err) reject(err)
        resolve({ data, info })
      })(ctx)
    })
}
