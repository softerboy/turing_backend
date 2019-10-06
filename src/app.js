require('dotenv-flow').config()

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const KoaStatic = require('koa-static')
const send = require('koa-send')
const { ApolloServer } = require('apollo-server-koa')
const { importSchema } = require('graphql-import')
const path = require('path')

const typeDefs = importSchema('src/schema.graphql')
const passportJwtMiddleware = require('./auth/passport-jwt')
require('./auth/passport-facebook')
const loaders = require('./loaders')
const resolvers = require('./resolvers')
const db = require('./db')
const router = require('./routes')

const context = ({ ctx: koaCtx }) => ({
  db,
  koaCtx,
  loaders,
})

const app = new Koa()
app.use(bodyParser())
// setup passport middleware
app.use(passportJwtMiddleware)
app.use(KoaStatic(path.join(__dirname, '..', 'public')))
app.use(router.routes())

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context,
})

server.applyMiddleware({ app })

// this last middleware catches any request that isn't handled by
// koa-static or koa-router, ie your index.html
app.use(ctx =>
  send(ctx, 'index.html', {
    root: path.join(__dirname, '..', 'public'),
  }),
)

const port = process.env.PORT
// eslint-disable-next-line no-console
app.listen({ port }, () => console.log(`App listens on port ${port}`))

// required in testing
module.exports = server
